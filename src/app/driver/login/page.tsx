import DriverLoginForm from "@/components/driver/LoginForm";
import { AGENCY } from "@/config/agency";

export default function DriverLogin() {
  return <div className="grid min-h-screen place-items-center p-4"><DriverLoginForm agency={AGENCY.name} /></div>;
}
