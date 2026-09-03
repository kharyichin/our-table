import type { ReactNode } from "react";
import { DishIllustration } from "@/components/illustrations/FoodIllustration";

export function AuthBookShell({
  title,
  introduction,
  children,
}: {
  title: string;
  introduction: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-book-page">
      <main className="auth-book" aria-label="Our Table account">
        <section className="auth-book-story" aria-label="About Our Table">
          <div>
            <p className="auth-wordmark">Our Table</p>
            <p className="auth-promise">The meals you make become the story you keep.</p>
          </div>

          <div className="auth-illustrations" aria-hidden="true">
            <DishIllustration seed="auth-tomato-supper" tags={["tomato", "italian"]} className="auth-dish auth-dish-one" />
            <DishIllustration seed="auth-rice-bowl" tags={["rice", "japanese"]} className="auth-dish auth-dish-two" />
            <DishIllustration seed="auth-greens" tags={["tofu", "thai"]} className="auth-dish auth-dish-three" />
          </div>

          <ol className="auth-story-list">
            <li><span>1</span>Save the dishes and grocery finds you discover together.</li>
            <li><span>2</span>Turn them into a week you can shop for and cook.</li>
            <li><span>3</span>Keep what happened as part of your household story.</li>
          </ol>
        </section>

        <section className="auth-book-action">
          <div className="auth-action-inner">
            <p className="auth-running-title">A household food journal</p>
            <h1>{title}</h1>
            <p className="auth-introduction">{introduction}</p>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
