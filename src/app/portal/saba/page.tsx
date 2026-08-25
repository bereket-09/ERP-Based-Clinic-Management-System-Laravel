import { Sparkles } from "lucide-react";
import { requireStudent } from "@/server/session";
import { isFeatureEnabled } from "@/server/services/settings";
import { SabaChat } from "@/components/saba/saba-chat";

export const metadata = { title: "Ask Saba" };

export default async function PortalSabaPage() {
  await requireStudent();
  const on = await isFeatureEnabled("ai.assistant");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#0c1f3d] text-[#e0a112]">
            <Sparkles className="size-4" strokeWidth={1.5} />
          </span>
          Ask Saba
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saba is your friendly health guide. Tell her how you feel for gentle advice — she’s not a doctor, so
          please visit the clinic for anything that worries you.
        </p>
      </div>

      {on ? (
        <SabaChat
          scope="student"
          className="h-[560px]"
          suggestions={[
            "I have a headache and feel tired.",
            "How can I sleep better during exams?",
            "I've had a sore throat for two days.",
            "Tips to stay healthy on campus?",
          ]}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            The AI health guide isn’t enabled for the clinic right now. Please contact the clinic directly for help.
          </p>
        </div>
      )}
    </div>
  );
}
