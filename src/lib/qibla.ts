// Kaaba coordinates in Makkah.
const KAABA = { latitude: 21.4225, longitude: 39.8262 };

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

// Great-circle bearing from the user to the Kaaba, in degrees clockwise from true north.
export function qiblaBearing(lat: number, lon: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.latitude);
  const Δλ = toRad(KAABA.longitude - lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Heading of the phone's top edge from the magnetometer, in degrees from magnetic north.
// Assumes the phone is held flat; tilting it makes the reading less accurate.
export function headingFromMagnetometer(x: number, y: number): number {
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function angleDiff(target: number, heading: number): number {
  return ((target - heading + 540) % 360) - 180;
}
