"""
Seed Script for Flood-Flash Early Warning Backend.
Populates 18 realistic wards in Uttarakhand (Rudraprayag, Chamoli, Nainital districts),
safe zones, default RBAC users, sensor readings, risk assessments, historical incidents,
and multi-lingual subscribers with WhatsApp / SMS opt-in preferences.
"""

from datetime import datetime, timedelta
import random
from backend.app.config import settings
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.db_models import (
    Ward, SensorReading, RiskAssessment, HistoricalIncident, Subscriber, User, SafeZone,
    IncidentStatus, ReliefRequest, ReliefProvider, DonationLink, DonationTransaction
)
from backend.app.services.risk_engine import calculate_risk
from backend.app.services.auth_service import hash_password


def ensure_migrations_and_admin(db):
    """
    Non-destructive schema migrations and admin seeding for SQLite.
    Guarantees 'email' column on 'users' and 'donation_transactions' table exists.
    """
    from sqlalchemy import text
    try:
        # Check if email column exists in users
        cols = [row[1] for row in db.execute(text("PRAGMA table_info(users)")).fetchall()]
        if "email" not in cols:
            print("Migrating schema: Adding 'email' column to users table...")
            db.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
            db.commit()
    except Exception as e:
        print(f"Schema migration check note: {e}")

    # Ensure admin users exist
    admin_accounts = [
        {
            "username": "officer.rawat@uk-relief.gov.in",
            "email": "officer.rawat@uk-relief.gov.in",
            "password": "official123",
            "role": "district_official",
            "full_name": "Col. Sanjeev Rawat (Retd.)",
            "district": "Chamoli"
        },
        {
            "username": "vikram.negi@uk-relief.gov.in",
            "email": "vikram.negi@uk-relief.gov.in",
            "password": "official123",
            "role": "district_official",
            "full_name": "SDMA Officer - Vikram Negi",
            "district": "Dehradun HQ"
        },
        {
            "username": "admin_official",
            "email": "officer.name@uk-relief.gov.in",
            "password": "official123",
            "role": "district_official",
            "full_name": "Officer Sharma (District Disaster Authority)",
            "district": "Rudraprayag"
        },
        {
            "username": "observer",
            "email": "observer@uk-relief.gov.in",
            "password": "viewer123",
            "role": "viewer",
            "full_name": "Journalist / Public Observer",
            "district": "All"
        }
    ]

    for acc in admin_accounts:
        user = db.query(User).filter(
            (User.username == acc["username"]) | (User.email == acc["email"])
        ).first()
        if not user:
            user = User(
                username=acc["username"],
                email=acc["email"],
                hashed_password=hash_password(acc["password"]),
                role=acc["role"],
                full_name=acc["full_name"],
                district=acc["district"]
            )
            db.add(user)
        else:
            if not user.email:
                user.email = acc["email"]
    db.commit()

    # Ensure donation transactions exist
    if db.query(DonationTransaction).count() == 0:
        print("Seeding initial Razorpay donation ledger transactions...")
        sample_transactions = [
            DonationTransaction(
                payment_id="pay_Ok91Jd902",
                order_id="ord_live_99214",
                donor_name="Meera Bhandari",
                donor_email="meera.bhandari@uttarakhand.org",
                donor_phone="+91 98765 43210",
                donor_pan="ABCPB1234F",
                amount=5000.0,
                currency="INR",
                status="Paid",
                payment_method="UPI Autopay",
                receipt_number="#UK-80G-99214",
                created_at=datetime.utcnow() - timedelta(minutes=42)
            ),
            DonationTransaction(
                payment_id="pay_Ok90H711",
                order_id="ord_live_99213",
                donor_name="Garhwal Traders Welfare",
                donor_email="info@garhwalsociety.org",
                donor_phone="+91 99120 44102",
                donor_pan="AAATG9921D",
                amount=100000.0,
                currency="INR",
                status="Paid",
                payment_method="NetBanking (NEFT)",
                receipt_number="#UK-80G-99213",
                created_at=datetime.utcnow() - timedelta(hours=1, minutes=15)
            ),
            DonationTransaction(
                payment_id="pay_Ok89B552",
                order_id="ord_live_99212",
                donor_name="Pradeep Singh Rawat",
                donor_email="pradeep.rawat92@gmail.com",
                donor_phone="+91 94120 88201",
                donor_pan="BPNPR7712E",
                amount=2500.0,
                currency="INR",
                status="Paid",
                payment_method="UPI QR Intent",
                receipt_number="#UK-80G-99212",
                created_at=datetime.utcnow() - timedelta(hours=2, minutes=30)
            ),
            DonationTransaction(
                payment_id="pay_Ok88X190",
                order_id="ord_live_99211",
                donor_name="Sunita Negi",
                donor_email="sunita.negi@kotdwar.in",
                donor_phone="+91 97600 11984",
                donor_pan="CHXPN4412R",
                amount=1000.0,
                currency="INR",
                status="Failed",
                payment_method="Debit Card",
                receipt_number="INELIGIBLE (Failed)",
                created_at=datetime.utcnow() - timedelta(hours=3, minutes=45)
            ),
            DonationTransaction(
                payment_id="pay_Ok87M441",
                order_id="ord_live_99210",
                donor_name="Lt. Col. V.P. Sharma",
                donor_email="vpsharma.veteran@gov.in",
                donor_phone="+91 98110 33411",
                donor_pan="AACPV1109S",
                amount=25000.0,
                currency="INR",
                status="Paid",
                payment_method="Credit Card (Amex)",
                receipt_number="#UK-80G-99210",
                created_at=datetime.utcnow() - timedelta(hours=5, minutes=10)
            ),
            DonationTransaction(
                payment_id="pay_Ok86P221",
                order_id="ord_live_99209",
                donor_name="Rohit Dimri",
                donor_email="rohit.dimri@outlook.com",
                donor_phone="+91 95400 99201",
                donor_pan="DIMPR9081K",
                amount=2500.0,
                currency="INR",
                status="Refunded",
                payment_method="UPI App (GPay)",
                receipt_number="REVOKED (#UK-80G-99209)",
                cancellation_reason="Duplicate contribution by donor",
                created_at=datetime.utcnow() - timedelta(hours=18)
            ),
            DonationTransaction(
                payment_id="pay_N83aKd991j",
                order_id="ord_live_99208",
                donor_name="Col. Sanjeev Rawat (Retd.)",
                donor_email="sanjeev.rawat@veterans.org",
                donor_phone="+91 94111 02931",
                donor_pan="ABCPR5501H",
                amount=25000.0,
                currency="INR",
                status="Paid",
                payment_method="UPI / GPay",
                receipt_number="#UK-80G-99208",
                created_at=datetime.utcnow() - timedelta(minutes=2)
            ),
            DonationTransaction(
                payment_id="pay_N83aKx882a",
                order_id="ord_live_99207",
                donor_name="Anita Joshi",
                donor_email="anita.joshi@kumaon.edu",
                donor_phone="+91 98230 44921",
                donor_pan="AQUPJ2209K",
                amount=2500.0,
                currency="INR",
                status="Paid",
                payment_method="NetBanking HDFC",
                receipt_number="#UK-80G-99207",
                created_at=datetime.utcnow() - timedelta(minutes=7)
            ),
            DonationTransaction(
                payment_id="pay_N83aLp330w",
                order_id="ord_live_99206",
                donor_name="Dr. Ramesh Nautiyal",
                donor_email="dr.nautiyal@alims.org",
                donor_phone="+91 98970 11922",
                donor_pan="ACCPN9910D",
                amount=50000.0,
                currency="INR",
                status="Paid",
                payment_method="RuPay Corporate",
                receipt_number="#UK-80G-99206",
                created_at=datetime.utcnow() - timedelta(minutes=14)
            ),
            DonationTransaction(
                payment_id="pay_N83aMq115k",
                order_id="ord_live_99205",
                donor_name="Anonymous Citizen",
                donor_email="anonymous.citizen@uk-relief.org",
                donor_phone="+91 90000 00000",
                donor_pan="XXXXX0000X",
                amount=1000.0,
                currency="INR",
                status="Paid",
                payment_method="UPI / BHIM",
                receipt_number="#UK-80G-99205",
                created_at=datetime.utcnow() - timedelta(minutes=19)
            )
        ]
        for tx in sample_transactions:
            db.add(tx)
        db.commit()


def seed_database(reset: bool = False):
    if reset:
        print("Resetting database tables (--reset flag active)...")
        Base.metadata.drop_all(bind=engine)
    else:
        print("Ensuring database tables exist (non-destructive)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        ensure_migrations_and_admin(db)
        if not reset:
            existing_ward = db.query(Ward).first()
            if existing_ward:
                print("Database already contains data and --reset was not passed. Skipping ward re-seed.")
                return

        official_user = None
        viewer_user = None

        if settings.ENVIRONMENT.lower() == "development":
            print("1. Ensuring RBAC Users (Development environment)...")
            official_user = db.query(User).filter(User.username == "admin_official").first()
            if not official_user:
                official_user = User(
                    username="admin_official",
                    email="officer.name@uk-relief.gov.in",
                    hashed_password=hash_password("official123"),
                    role="district_official",
                    full_name="Officer Sharma (District Disaster Authority)",
                    district="Rudraprayag"
                )
                db.add(official_user)

            viewer_user = db.query(User).filter(User.username == "observer").first()
            if not viewer_user:
                viewer_user = User(
                    username="observer",
                    email="observer@uk-relief.gov.in",
                    hashed_password=hash_password("viewer123"),
                    role="viewer",
                    full_name="Journalist / Public Observer",
                    district="All"
                )
                db.add(viewer_user)
            db.flush()
        else:
            print(f"1. Production environment detected (ENVIRONMENT='{settings.ENVIRONMENT}'): Skipping default demo user/password seeding.")

        print("2. Seeding Safe Zones...")
        safe_zones_data = [
            # Rudraprayag
            {"name": "Mandakini Helipad Ground", "latitude": 30.7350, "longitude": 79.0670, "capacity": 2500, "district": "Rudraprayag", "safe_zone_type": "Helipad & Open Deck", "ward_ids": "1,6"},
            {"name": "Government Inter College Campus", "latitude": 30.5260, "longitude": 79.0790, "capacity": 1800, "district": "Rudraprayag", "safe_zone_type": "School Complex", "ward_ids": "2,4"},
            {"name": "Agastyamuni Sports Stadium", "latitude": 30.3960, "longitude": 78.9820, "capacity": 4000, "district": "Rudraprayag", "safe_zone_type": "Sports Complex", "ward_ids": "3,5"},

            # Chamoli
            {"name": "Army Helipad & ITBP Camp Ground", "latitude": 30.5570, "longitude": 79.5660, "capacity": 5000, "district": "Chamoli", "safe_zone_type": "Military Camp", "ward_ids": "7,11"},
            {"name": "Badrinath Bus Stand Elevated Enclosure", "latitude": 30.7440, "longitude": 79.4940, "capacity": 3000, "district": "Chamoli", "safe_zone_type": "Elevated Bus Terminal", "ward_ids": "8,12"},
            {"name": "District Sports Stadium Gopeshwar", "latitude": 30.4080, "longitude": 79.3250, "capacity": 3500, "district": "Chamoli", "safe_zone_type": "Municipal Stadium", "ward_ids": "9,10"},

            # Nainital
            {"name": "Flatts Ground Mallital", "latitude": 29.3950, "longitude": 79.4540, "capacity": 6000, "district": "Nainital", "safe_zone_name": "Flatts Ground", "safe_zone_type": "Public Open Ground", "ward_ids": "13,14"},
            {"name": "TB Sanatorium Open Grounds Bhowali", "latitude": 29.3840, "longitude": 79.5170, "capacity": 2000, "district": "Nainital", "safe_zone_type": "Sanatorium Grounds", "ward_ids": "15,18"},
            {"name": "IVRI Campus Sports Ground Mukteshwar", "latitude": 29.4730, "longitude": 79.6480, "capacity": 1500, "district": "Nainital", "safe_zone_type": "Institute Campus", "ward_ids": "16,17"}
        ]

        for sz in safe_zones_data:
            safe_zone = SafeZone(
                name=sz["name"],
                latitude=sz["latitude"],
                longitude=sz["longitude"],
                capacity=sz["capacity"],
                district=sz["district"],
                safe_zone_type=sz["safe_zone_type"],
                associated_ward_ids=sz["ward_ids"]
            )
            db.add(safe_zone)

        print("3. Seeding Uttarakhand Wards...")
        wards_data = [
            # Rudraprayag District
            {
                "name": "Kedarnath Town Ward",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 2400,
                "latitude": 30.7346,
                "longitude": 79.0669,
                "safe_zone_name": "Mandakini Helipad Ground",
                "slope_angle": 42.0,
                "init_r72": 215.0, "init_sm": 84.0, "init_r1": 42.0
            },
            {
                "name": "Guptkashi Hill Ward",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 4800,
                "latitude": 30.5258,
                "longitude": 79.0784,
                "safe_zone_name": "Government Inter College Campus",
                "slope_angle": 35.0,
                "init_r72": 165.0, "init_sm": 68.0, "init_r1": 15.0
            },
            {
                "name": "Agastyamuni Riverbed Ward",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 7200,
                "latitude": 30.3956,
                "longitude": 78.9818,
                "safe_zone_name": "Agastyamuni Sports Stadium",
                "slope_angle": 22.0,
                "init_r72": 95.0, "init_sm": 54.0, "init_r1": 8.0
            },
            {
                "name": "Ukhimath Upper Ridge",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 3600,
                "latitude": 30.5167,
                "longitude": 79.0944,
                "safe_zone_name": "Government Inter College Campus",
                "slope_angle": 38.0,
                "init_r72": 185.0, "init_sm": 76.0, "init_r1": 22.0
            },
            {
                "name": "Tilwara Bypass Ward",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 5100,
                "latitude": 30.3475,
                "longitude": 78.9760,
                "safe_zone_name": "Agastyamuni Sports Stadium",
                "slope_angle": 28.0,
                "init_r72": 45.0, "init_sm": 38.0, "init_r1": 3.0
            },
            {
                "name": "Sonprayag Transit Hub",
                "district": "Rudraprayag",
                "state": "Uttarakhand",
                "population": 1900,
                "latitude": 30.6300,
                "longitude": 78.9950,
                "safe_zone_name": "Mandakini Helipad Ground",
                "slope_angle": 40.0,
                "init_r72": 240.0, "init_sm": 88.0, "init_r1": 48.0
            },

            # Chamoli District
            {
                "name": "Joshimath Upper Bazar",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 16500,
                "latitude": 30.5564,
                "longitude": 79.5658,
                "safe_zone_name": "Army Helipad & ITBP Camp Ground",
                "slope_angle": 44.0,
                "init_r72": 225.0, "init_sm": 86.0, "init_r1": 38.0
            },
            {
                "name": "Badrinath Dham Ward",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 3100,
                "latitude": 30.7433,
                "longitude": 79.4938,
                "safe_zone_name": "Badrinath Bus Stand Elevated Enclosure",
                "slope_angle": 36.0,
                "init_r72": 155.0, "init_sm": 70.0, "init_r1": 18.0
            },
            {
                "name": "Karnaprayag Sangam Ward",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 12800,
                "latitude": 30.2608,
                "longitude": 79.2178,
                "safe_zone_name": "District Sports Stadium Gopeshwar",
                "slope_angle": 26.0,
                "init_r72": 110.0, "init_sm": 58.0, "init_r1": 12.0
            },
            {
                "name": "Gopeshwar Civil Lines",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 21400,
                "latitude": 30.4072,
                "longitude": 79.3244,
                "safe_zone_name": "District Sports Stadium Gopeshwar",
                "slope_angle": 32.0,
                "init_r72": 35.0, "init_sm": 32.0, "init_r1": 2.0
            },
            {
                "name": "Pipalkoti Highway Ward",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 4200,
                "latitude": 30.4320,
                "longitude": 79.4280,
                "safe_zone_name": "Army Helipad & ITBP Camp Ground",
                "slope_angle": 37.0,
                "init_r72": 170.0, "init_sm": 69.0, "init_r1": 21.0
            },
            {
                "name": "Govindghat Valley Ward",
                "district": "Chamoli",
                "state": "Uttarakhand",
                "population": 1800,
                "latitude": 30.6220,
                "longitude": 79.5580,
                "safe_zone_name": "Badrinath Bus Stand Elevated Enclosure",
                "slope_angle": 41.0,
                "init_r72": 85.0, "init_sm": 52.0, "init_r1": 9.0
            },

            # Nainital District
            {
                "name": "Mallital Lake View Ward",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 18200,
                "latitude": 29.3949,
                "longitude": 79.4533,
                "safe_zone_name": "Flatts Ground Mallital",
                "slope_angle": 34.0,
                "init_r72": 158.0, "init_sm": 67.0, "init_r1": 16.0
            },
            {
                "name": "Tallital Bus Stand Ward",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 15400,
                "latitude": 29.3824,
                "longitude": 79.4636,
                "safe_zone_name": "Flatts Ground Mallital",
                "slope_angle": 31.0,
                "init_r72": 90.0, "init_sm": 55.0, "init_r1": 10.0
            },
            {
                "name": "Bhowali Junction Ward",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 9600,
                "latitude": 29.3833,
                "longitude": 79.5167,
                "safe_zone_name": "TB Sanatorium Open Grounds Bhowali",
                "slope_angle": 29.0,
                "init_r72": 30.0, "init_sm": 28.0, "init_r1": 1.0
            },
            {
                "name": "Ramgarh Orchard Ridge",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 3800,
                "latitude": 29.4300,
                "longitude": 79.5500,
                "safe_zone_name": "IVRI Campus Sports Ground Mukteshwar",
                "slope_angle": 33.0,
                "init_r72": 205.0, "init_sm": 82.0, "init_r1": 36.0
            },
            {
                "name": "Mukteshwar Peak Ward",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 2900,
                "latitude": 29.4722,
                "longitude": 79.6472,
                "safe_zone_name": "IVRI Campus Sports Ground Mukteshwar",
                "slope_angle": 39.0,
                "init_r72": 42.0, "init_sm": 34.0, "init_r1": 2.0
            },
            {
                "name": "Bhimtal Lake Basin",
                "district": "Nainital",
                "state": "Uttarakhand",
                "population": 10500,
                "latitude": 29.3500,
                "longitude": 79.5500,
                "safe_zone_name": "TB Sanatorium Open Grounds Bhowali",
                "slope_angle": 25.0,
                "init_r72": 25.0, "init_sm": 25.0, "init_r1": 0.0
            }
        ]

        sub_phone_counter = 9876543210

        incidents_pool = [
            ("2013-06-17", "flash_flood", "Severe", 4000, "Catastrophic cloudburst and Mandakini river overflow causing massive debris flows."),
            ("2021-02-07", "flash_flood", "Severe", 204, "Glacial lake outburst flood (GLOF) in Rishiganga valley damaging hydel projects."),
            ("2021-10-19", "landslide", "High", 12, "Torrential 72-hour rainfall triggered multi-site slope collapses blocking NH-107."),
            ("2023-01-10", "landslide", "High", 0, "Rapid land subsidence and slope cracks affecting structural safety of hill structures."),
            ("2022-08-20", "flash_flood", "Medium", 4, "Local cloudburst causing flash flood in stream catchment and road washouts."),
            ("2020-07-28", "landslide", "Medium", 2, "Debris flow triggered by continuous monsoonal downpour.")
        ]

        sub_personas = [
            ("Rajesh Kumar", "official", "hi", True),
            ("Anita Negi", "resident", "hi", False),       # Opted-out of WA -> triggers SMS Fallback!
            ("Sunita Devi", "village_head", "gar", True),
            ("Suresh Chandra", "resident", "gar", False),    # Opted-out of WA -> triggers SMS Fallback!
            ("Vikram Singh", "official", "en", True)
        ]

        for wdata in wards_data:
            ward = Ward(
                name=wdata["name"],
                district=wdata["district"],
                state=wdata["state"],
                population=wdata["population"],
                latitude=wdata["latitude"],
                longitude=wdata["longitude"],
                safe_zone_name=wdata["safe_zone_name"],
                soil_cohesion_kpa=wdata.get("soil_cohesion_kpa", 12.0),
                soil_friction_angle_deg=wdata.get("soil_friction_angle_deg", 30.0),
                soil_unit_weight_kn_m3=wdata.get("soil_unit_weight_kn_m3", 19.0)
            )
            db.add(ward)
            db.flush()


            # 1. Historical Sensor Readings (Last 72 hours time series)
            now = datetime.utcnow()
            base_r72 = wdata["init_r72"]
            base_sm = wdata["init_sm"]
            base_r1 = wdata["init_r1"]
            slope = wdata["slope_angle"]

            for i in range(12, -1, -1):
                timestamp = now - timedelta(hours=i * 6)
                factor = (13 - i) / 13.0
                r72_curr = round(max(0.0, base_r72 * (0.4 + 0.6 * factor) + random.uniform(-5, 5)), 1)
                sm_curr = round(max(10.0, min(100.0, base_sm * (0.5 + 0.5 * factor) + random.uniform(-2, 2))), 1)
                r1_curr = round(max(0.0, base_r1 * factor + random.uniform(-1, 1)), 1) if i == 0 else round(random.uniform(0, 10), 1)
                r24_curr = round(r72_curr * 0.45, 1)

                reading = SensorReading(
                    ward_id=ward.id,
                    timestamp=timestamp,
                    rainfall_1h_mm=r1_curr,
                    rainfall_24h_mm=r24_curr,
                    rainfall_72h_mm=r72_curr,
                    soil_moisture_pct=sm_curr,
                    slope_angle_deg=slope
                )
                db.add(reading)

            # 2. Latest Risk Assessment
            latest_reading = SensorReading(
                ward_id=ward.id,
                timestamp=now,
                rainfall_1h_mm=base_r1,
                rainfall_24h_mm=round(base_r72 * 0.45, 1),
                rainfall_72h_mm=base_r72,
                soil_moisture_pct=base_sm,
                slope_angle_deg=slope
            )
            
            risk_res = calculate_risk(latest_reading, ward)
            
            risk_assessment = RiskAssessment(
                ward_id=ward.id,
                timestamp=now,
                risk_level=risk_res["risk_level"],
                risk_score=risk_res["risk_score"],
                contributing_factors="\n".join(risk_res["contributing_factors"])
            )
            db.add(risk_assessment)

            # 3. Add 2-3 Historical Incidents
            num_incidents = random.randint(2, 3)
            selected_incidents = random.sample(incidents_pool, num_incidents)
            for date_str, itype, sev, cas, desc in selected_incidents:
                incident = HistoricalIncident(
                    ward_id=ward.id,
                    date=date_str,
                    incident_type=itype,
                    severity=sev,
                    casualties=cas,
                    description=desc
                )
                db.add(incident)

            # 4. Add Multi-Lingual & Opt-In Subscribers (3-5 per ward)
            num_subs = random.randint(3, 5)
            for idx in range(num_subs):
                name, role, lang, wa_opt = sub_personas[idx % len(sub_personas)]
                phone = f"+91{sub_phone_counter}"
                sub_phone_counter += 1

                subscriber = Subscriber(
                    ward_id=ward.id,
                    name=f"{name} ({ward.name.split()[0]})",
                    phone_number=phone,
                    role=role,
                    whatsapp_opted_in=wa_opt,
                    preferred_language=lang
                )
                db.add(subscriber)

        db.commit()

        print("5. Seeding Relief Providers...")
        provider1 = ReliefProvider(
            name="Indian Red Cross Society (Uttarakhand Branch)",
            type="ngo",
            phone="+919812345678",
            what_they_can_offer="Emergency medical first-aid kits, water purification tablets, high-altitude tents, and dry ration kits.",
            ward_ids_covered="1,6,7,8",
            verified=True,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        provider2 = ReliefProvider(
            name="Uttarakhand Mountain Rescue & Logistics Fleet",
            type="business",
            phone="+919876501234",
            what_they_can_offer="4x4 Mahindra Boleros for emergency transit, rope evacuation gear, and heavy debris winch equipment.",
            ward_ids_covered="*",
            verified=True,
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        provider3 = ReliefProvider(
            name="Garhwal Yuva Relief Samiti",
            type="individual",
            phone="+919845678901",
            what_they_can_offer="Volunteer workforce for clearing mudslides, distributing cooked meals, and setting up solar lamps.",
            ward_ids_covered="1,6",
            verified=False,
            created_at=datetime.utcnow() - timedelta(hours=18)
        )
        db.add(provider1)
        db.add(provider2)
        db.add(provider3)
        db.flush()

        print("6. Seeding Active Incident Statuses & Relief Requests...")
        # Active Incident Wards: 1 (Kedarnath Town Ward), 6 (Sonprayag Transit Hub), 7 (Joshimath Upper Bazar)
        inc1 = IncidentStatus(
            ward_id=1,
            incident_active=True,
            incident_started_at=datetime.utcnow() - timedelta(hours=8),
            incident_description="Severe monsoonal cloudburst & rapid slope collapse along Mandakini valley catchment. Evacuation in progress.",
            official_who_activated_id=official_user.id if official_user else None
        )
        inc6 = IncidentStatus(
            ward_id=6,
            incident_active=True,
            incident_started_at=datetime.utcnow() - timedelta(hours=4),
            incident_description="Debris flow & riverbed overflow blocking NH-107 transit corridor. Relief camp operational at Mandakini Helipad Ground.",
            official_who_activated_id=official_user.id if official_user else None
        )
        inc7 = IncidentStatus(
            ward_id=7,
            incident_active=True,
            incident_started_at=datetime.utcnow() - timedelta(hours=14),
            incident_description="Substantial land subsidence & structural wall fractures requiring immediate evacuation to Army Helipad shelter.",
            official_who_activated_id=official_user.id if official_user else None
        )
        db.add(inc1)
        db.add(inc6)
        db.add(inc7)

        # Seed initial Relief Requests
        reqs = [
            ReliefRequest(
                ward_id=1,
                requester_name="Gram Pradhan Rameshwar Negi",
                requester_phone="+919876543201",
                need_type="food",
                description="Urgent requirement for 50 dry ration packets and clean drinking water jerrycans for stranded pilgrims.",
                people_affected_count=45,
                urgency="critical",
                status="open",
                created_at=datetime.utcnow() - timedelta(hours=6)
            ),
            ReliefRequest(
                ward_id=1,
                requester_name="Dr. Anita Sharma (PHC Kedarnath)",
                requester_phone="+919876543202",
                need_type="medical",
                description="Emergency trauma kits, wound dressings, and Portable Oxygen Cylinders required at medical aid post.",
                people_affected_count=12,
                urgency="critical",
                status="in_progress",
                fulfilled_by_id=provider1.id,
                created_at=datetime.utcnow() - timedelta(hours=5)
            ),
            ReliefRequest(
                ward_id=1,
                requester_name="Sunil Kumar (Local Volunteer)",
                requester_phone="+919876543203",
                need_type="shelter",
                description="30 waterproof tarpaulins and heavy-duty fleece blankets for families displaced by slope movement.",
                people_affected_count=30,
                urgency="high",
                status="open",
                created_at=datetime.utcnow() - timedelta(hours=3)
            ),
            ReliefRequest(
                ward_id=6,
                requester_name="Vikram Singh Rawat",
                requester_phone="+919876543206",
                need_type="water",
                description="Drinking water supply disrupted due to pipeline washout. 500L water tanker needed near transit camp.",
                people_affected_count=80,
                urgency="high",
                status="open",
                created_at=datetime.utcnow() - timedelta(hours=2)
            ),
            ReliefRequest(
                ward_id=6,
                requester_name="Pooja Devi (Asha Lead)",
                requester_phone="+919876543207",
                need_type="clothing",
                description="Dry clothes and baby milk powder for 15 children housed at Mandakini Helipad shelter.",
                people_affected_count=15,
                urgency="medium",
                status="fulfilled",
                fulfilled_by_id=provider2.id,
                fulfilled_at=datetime.utcnow() - timedelta(hours=1),
                created_at=datetime.utcnow() - timedelta(hours=4)
            ),
            ReliefRequest(
                ward_id=7,
                requester_name="Subedar Major (Retd) H. S. Bisht",
                requester_phone="+919876543210",
                need_type="rescue",
                description="Heavy excavator & winch assistance needed to clear rockfall obstructing evacuation path near Upper Bazar.",
                people_affected_count=22,
                urgency="critical",
                status="open",
                created_at=datetime.utcnow() - timedelta(hours=7)
            )
        ]
        for r in reqs:
            db.add(r)

        print("7. Seeding Curated External Donation Links...")
        donations = [
            DonationLink(
                ward_id=None,
                organization_name="Uttarakhand State Disaster Response Fund (SDRF)",
                organization_type="State Government Disaster Fund",
                donation_url="https://cmrf.uk.gov.in",
                description="Official Chief Minister's Relief Fund & SDRF account dedicated to emergency relief, evacuation, and mountain rehabilitation across Uttarakhand."
            ),
            DonationLink(
                ward_id=None,
                organization_name="Prime Minister's National Relief Fund (PMNRF)",
                organization_type="National Statutory Relief Fund",
                donation_url="https://pmnrf.gov.in",
                description="National fund providing immediate financial assistance to families affected by major natural disasters and cloudburst events."
            ),
            DonationLink(
                ward_id=1,
                organization_name="Himalayan Relief & Rehabilitation Trust",
                organization_type="Verified Registered NGO",
                donation_url="https://himalayanrelief.org",
                description="On-ground Uttarakhand registered charity distributing emergency rations, solar lanterns, and medical supplies directly in high-altitude hill wards."
            )
        ]
        for d in donations:
            db.add(d)

        db.commit()
        print(f"Successfully seeded database with Users, Safe Zones, Wards, Active Incidents, Relief Requests, Relief Providers, Donation Links, and Sensor Telemetry.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed database for Flood-Flash backend")
    parser.add_argument("--reset", action="store_true", help="Explicitly drop and re-create all database tables before seeding.")
    args = parser.parse_args()
    seed_database(reset=args.reset)
