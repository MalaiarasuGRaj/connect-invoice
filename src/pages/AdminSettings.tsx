import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@clerk/clerk-react';
import { Settings, ArrowLeft } from 'lucide-react';

export default function AdminSettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-header sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground tracking-tight">
                Admin Settings
              </h1>
              <p className="text-[11px] text-primary-foreground/70">
                Manage your account
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <UserProfile
          routing="path"
          path="/admin/settings"
          appearance={{
            elements: {
              rootBox: "mx-auto shadow-elevated rounded-xl max-w-4xl w-full",
              card: "bg-card border-border",
              navbar: "border-r border-border",
              navbarButton: "text-foreground hover:bg-accent",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              profileSectionTitleText: "text-foreground font-semibold",
              profileSectionContent: "text-muted-foreground",
              formButtonPrimary: "gradient-primary text-primary-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background border-border text-foreground",
              accordionTriggerButton: "text-foreground",
              userPreviewMainIdentifier: "text-foreground",
              userPreviewSecondaryIdentifier: "text-muted-foreground",
              breadcrumbsItem: "text-muted-foreground",
              breadcrumbsItemCurrent: "text-foreground"
            }
          }}
        />
      </main>
    </div>
  );
}
