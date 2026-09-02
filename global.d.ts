declare module "*.css";
declare module 'recharts';
declare module 'react-day-picker';
declare module 'input-otp';
declare module 'jsonwebtoken' {
	const jwt: any;
	export default jwt;
}
declare module '@/context/direction-provider' {
	export type Direction = 'ltr' | 'rtl' | string;
}