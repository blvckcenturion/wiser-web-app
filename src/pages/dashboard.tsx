import { AuthService } from "@/services/authService";
import { useRouter } from "next/router";

export default function Dashboard() {
    const router = useRouter();
    return (
        <>
            <h1>Dashboard</h1>
            <button onClick={() => { AuthService.removeCredentials;  router.push("/")}}>
                Logout
            </button>
        </>
    )
}
