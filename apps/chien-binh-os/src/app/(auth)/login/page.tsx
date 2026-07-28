import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Card className="bg-cb-panel border-cb-line w-full max-w-sm">
      <CardContent className="pt-6">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
