/**
 * Native Mobile Service for FloodFlash Citizen App.
 * Interfaces with Capacitor Native Hardware APIs (GPS, Haptics, Network, Notifications)
 * with graceful web fallbacks when running in a mobile browser.
 */

import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Get device GPS coordinates (high accuracy)
 */
export async function getDeviceLocation() {
 try {
 const perm = await Geolocation.checkPermissions();
 if (perm.location !== 'granted') {
 const requested = await Geolocation.requestPermissions();
 if (requested.location !== 'granted') {
 throw new Error("Location permission denied by user.");
 }
 }

 const coordinates = await Geolocation.getCurrentPosition({
 enableHighAccuracy: true,
 timeout: 10000
 });

 return {
 latitude: coordinates.coords.latitude,
 longitude: coordinates.coords.longitude,
 accuracy: coordinates.coords.accuracy
 };
 } catch (nativeErr) {
 console.warn("[MobileNative] Capacitor GPS fallback to Web Geolocation:", nativeErr.message);
 return new Promise((resolve, reject) => {
 if (!navigator.geolocation) {
 reject(new Error("Geolocation is not supported by your device"));
 return;
 }
 navigator.geolocation.getCurrentPosition(
 (pos) => resolve({
 latitude: pos.coords.latitude,
 longitude: pos.coords.longitude,
 accuracy: pos.coords.accuracy
 }),
 (err) => reject(err),
 { enableHighAccuracy: true, timeout: 10000 }
 );
 });
 }
}

/**
 * Trigger vibration siren on phone for emergency hazard warnings
 */
export async function triggerHazardSirenHaptics() {
 try {
 await Haptics.notification({ type: NotificationType.Error });
 setTimeout(async () => {
 await Haptics.vibrate({ duration: 800 });
 }, 200);
 } catch {
 if (navigator.vibrate) {
 navigator.vibrate([200, 100, 200, 100, 500]);
 }
 }
}

/**
 * Trigger light button tap feedback
 */
export async function triggerTapHaptic() {
 try {
 await Haptics.impact({ style: ImpactStyle.Light });
 } catch {
 if (navigator.vibrate) navigator.vibrate(25);
 }
}

/**
 * Schedule or send an immediate native local push notification
 */
export async function sendLocalSirenNotification(title, body) {
 try {
 const perm = await LocalNotifications.checkPermissions();
 if (perm.display !== 'granted') {
 await LocalNotifications.requestPermissions();
 }

 await LocalNotifications.schedule({
 notifications: [
 {
 title: `🚨 ${title}`,
 body: body,
 id: Math.floor(Math.random() * 100000),
 schedule: { at: new Date(Date.now() + 100) },
 sound: 'alarm.wav',
 actionTypeId: '',
 extra: null
 }
 ]
 });
 } catch (e) {
 console.warn("[MobileNative] Local notification fallback:", e.message);
 if ('Notification' in window && Notification.permission === 'granted') {
 new Notification(`🚨 ${title}`, { body });
 }
 }
}

/**
 * Listen for online / offline network changes (critical for flood zones)
 */
export function subscribeNetworkStatus(onStatusChange) {
 let removeListener = null;

 try {
 Network.getStatus().then(status => onStatusChange(status.connected));
 const handle = Network.addListener('networkStatusChange', status => {
 onStatusChange(status.connected);
 });
 removeListener = () => handle.then(h => h.remove());
 } catch {
 onStatusChange(navigator.onLine);
 const onlineHandler = () => onStatusChange(true);
 const offlineHandler = () => onStatusChange(false);
 window.addEventListener('online', onlineHandler);
 window.addEventListener('offline', offlineHandler);
 removeListener = () => {
 window.removeEventListener('online', onlineHandler);
 window.removeEventListener('offline', offlineHandler);
 };
 }

 return removeListener;
}
