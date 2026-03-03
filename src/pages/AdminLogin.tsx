import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignIn } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Invoice Form
        </Button>
      </div>

      <SignIn
        routing="path"
        path="/admin/login"
        signUpUrl="/admin/signup"
        fallbackRedirectUrl="/admin"
        appearance={{
          elements: {
            rootBox: "mx-auto shadow-elevated rounded-xl",
            card: "bg-card border-border",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-background border-border text-foreground hover:bg-accent",
            formButtonPrimary: "gradient-primary text-primary-foreground",
            footerActionLink: "text-primary hover:text-primary/90",
            identityPreviewText: "text-foreground",
            identityPreviewEditButtonIcon: "text-primary",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-border text-foreground"
          }
        }}
      />
    </div>
  );
}
