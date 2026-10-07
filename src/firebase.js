import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/messaging";

window.firebase = firebase;

const firebaseConfig = {
  apiKey: "AIzaSyC-duXYWQi03qRhNZxTN_4jVcIMUdIHZAg",
  authDomain: "president-hotel-log.firebaseapp.com",
  projectId: "president-hotel-log",
  storageBucket: "president-hotel-log.firebasestorage.app",
  messagingSenderId: "301248942592",
  appId: "1:301248942592:web:1ee6398d27c55d29753ee5",
};

try {
  firebase.initializeApp(firebaseConfig);
  window.fbDb = firebase.firestore();
  window.fbStorage = firebase.storage();
} catch (e) {
  console.error("Firebase init failed. กรุณาตรวจสอบ firebaseConfig", e);
  window.fbDb = null;
  window.fbStorage = null;
}

/* ---------- Push notification (Firebase Cloud Messaging) ---------- */
const FCM_VAPID_KEY =
  "BJMLbHPheZS5i9TktXpNctoSSfVs5Eh4BjV_vGyd9NvCsJQ91tM8OUwm9QlKLveg9I8wrtrNKaWUd6qaD_RRQUk";

try {
  if (firebase.messaging.isSupported && firebase.messaging.isSupported()) {
    window.fbMessaging = firebase.messaging();
  } else {
    window.fbMessaging = null;
  }
} catch (e) {
  console.error("Firebase Messaging init failed", e);
  window.fbMessaging = null;
}

/* สถานะการแจ้งเตือนที่ UI จะมาอ่าน: unknown | unsupported | default | denied | granted */
window.pmNotifState = { status: "unknown" };

function pmNotifSyncStatus() {
  if (!("Notification" in window) || !window.fbMessaging || !("serviceWorker" in navigator)) {
    window.pmNotifState.status = "unsupported";
  } else {
    window.pmNotifState.status = Notification.permission;
  }
  window.dispatchEvent(new CustomEvent("pmNotifStatusChanged"));
}
pmNotifSyncStatus();

/* เรียกจากปุ่ม "เปิดการแจ้งเตือน" (ต้องมาจากการคลิกของผู้ใช้) */
window.pmEnableNotifications = function () {
  return new Promise(function (resolve, reject) {
    if (!("Notification" in window) || !window.fbMessaging || !("serviceWorker" in navigator)) {
      pmNotifSyncStatus();
      reject(new Error("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน"));
      return;
    }
    if (!FCM_VAPID_KEY || FCM_VAPID_KEY.indexOf("PASTE_") === 0) {
      reject(new Error("ยังไม่ได้ตั้งค่า VAPID key (FCM_VAPID_KEY)"));
      return;
    }
    Notification.requestPermission()
      .then(function (perm) {
        pmNotifSyncStatus();
        if (perm !== "granted") {
          reject(new Error("ผู้ใช้ไม่อนุญาตการแจ้งเตือน"));
          return;
        }
        navigator.serviceWorker
          .register("./firebase-messaging-sw.js")
          .then(function (reg) {
            return window.fbMessaging.getToken({
              vapidKey: FCM_VAPID_KEY,
              serviceWorkerRegistration: reg,
            });
          })
          .then(function (token) {
            if (!token) {
              reject(new Error("ไม่สามารถขอ token การแจ้งเตือนได้"));
              return;
            }
            if (window.fbDb) {
              window.fbDb
                .collection("fcmTokens")
                .doc(token)
                .set(
                  {
                    token: token,
                    updatedAt: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                  },
                  { merge: true }
                )
                .then(function () {
                  resolve(token);
                })
                .catch(function (err) {
                  reject(err);
                });
            } else {
              resolve(token);
            }
          })
          .catch(function (err) {
            reject(err);
          });
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

/* แจ้งเตือนแบบ foreground (แอปเปิดอยู่) */
if (window.fbMessaging) {
  try {
    window.fbMessaging.onMessage(function (payload) {
      const title = (payload.notification && payload.notification.title) || "แจ้งเตือนงาน PM";
      window.dispatchEvent(new CustomEvent("pmNotifForeground", { detail: title }));
    });
  } catch (e) {
    console.error("onMessage listener error", e);
  }
}

export default firebase;
