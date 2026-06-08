import Head from "next/head";

import { DocsFooter } from "../components/docs-footer";
import { DocsTopbar } from "../components/docs-topbar";
import { HomeFeatureGrid } from "../components/home-feature-grid";
import { HomeHero } from "../components/home-hero";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>pokayoke docs</title>
        <meta
          name="description"
          content="Repo policy tooling for checks that sit between linting and project reachability."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen flex-col bg-white font-sans text-neutral-950 antialiased">
        <DocsTopbar />

        <main className="flex-1">
          <HomeHero />
          <HomeFeatureGrid />
        </main>

        <DocsFooter />
      </div>
    </>
  );
}
