import os
import unittest
from unittest.mock import MagicMock, patch

from backend.app.routers.alerts_router import email_risk_report
from backend.app.schemas.api_schemas import EmailRiskReportRequest
from backend.app.services.email_service import send_risk_report


class EmailRiskReportTests(unittest.TestCase):
    def setUp(self):
        self.payload = EmailRiskReportRequest(
            email="citizen@example.com",
            location_name="River Town",
            latitude=30.25,
            longitude=78.15,
            risk_level="WARNING",
            probability=0.65,
            advisory="Avoid the flooded river crossing.",
            auto_triggered=True,
        )

    @patch("backend.app.routers.alerts_router.send_risk_report")
    def test_auto_report_below_threshold_is_not_sent(self, send_report):
        with patch.dict(os.environ, {"ALERT_RISK_THRESHOLD": "0.7"}):
            result = email_risk_report(self.payload)

        self.assertEqual(result["status"], "threshold_not_met")
        self.assertFalse(result["sent"])
        send_report.assert_not_called()

    @patch("backend.app.routers.alerts_router.send_risk_report")
    def test_manual_report_bypasses_threshold(self, send_report):
        payload = self.payload.model_copy(update={"auto_triggered": False})
        with patch.dict(os.environ, {"ALERT_RISK_THRESHOLD": "0.7"}):
            result = email_risk_report(payload)

        self.assertEqual(result["status"], "success")
        self.assertTrue(result["sent"])
        send_report.assert_called_once()

    @patch("backend.app.routers.alerts_router.send_risk_report")
    def test_auto_report_at_threshold_is_sent(self, send_report):
        payload = self.payload.model_copy(update={"probability": 0.7})
        with patch.dict(os.environ, {"ALERT_RISK_THRESHOLD": "0.7"}):
            result = email_risk_report(payload)

        self.assertTrue(result["sent"])
        send_report.assert_called_once()

    @patch("backend.app.routers.alerts_router.send_risk_report")
    def test_auto_report_with_critical_level_is_sent_below_threshold(self, send_report):
        payload = self.payload.model_copy(update={"risk_level": "Critical"})
        with patch.dict(os.environ, {"ALERT_RISK_THRESHOLD": "0.7"}):
            result = email_risk_report(payload)

        self.assertTrue(result["sent"])
        send_report.assert_called_once()

    def test_missing_smtp_configuration_has_clear_error(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, "SMTP_EMAIL is not configured"):
                send_risk_report(
                    "citizen@example.com",
                    "River Town",
                    30.25,
                    78.15,
                    "WARNING",
                    0.7,
                    "Avoid the river crossing.",
                )

    @patch("backend.app.services.email_service.smtplib.SMTP_SSL")
    def test_report_contains_requested_risk_details(self, smtp_ssl):
        smtp = MagicMock()
        smtp_ssl.return_value.__enter__.return_value = smtp
        environment = {
            "SMTP_EMAIL": "sender@example.com",
            "SMTP_APP_PASSWORD": "app-password",
        }
        with patch.dict(os.environ, environment):
            send_risk_report(
                "citizen@example.com",
                "River Town",
                30.25,
                78.15,
                "WARNING",
                0.7,
                "Avoid the river crossing.",
            )

        message = smtp.send_message.call_args.args[0]
        body = message.get_content()
        self.assertIn("Location: River Town", body)
        self.assertIn("Coordinates: 30.25000, 78.15000", body)
        self.assertIn("Risk Probability: 70.0%", body)
        self.assertIn("Timestamp:", body)
        self.assertIn("Avoid the river crossing.", body)


if __name__ == "__main__":
    unittest.main()
