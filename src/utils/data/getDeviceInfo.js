export function getDeviceInfo() {
  const ua = navigator.userAgent;

  // 📱 DEVICE TYPE
  let device = "desktop";
  if (/Mobi|Android|iPhone/i.test(ua)) device = "mobile";
  else if (/iPad|Tablet/i.test(ua)) device = "tablet";

  // 💻 OS
  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "MacOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // 🌐 BROWSER
  let browser = "Unknown";

  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return {
    device,
    os,
    browser,
  };
}