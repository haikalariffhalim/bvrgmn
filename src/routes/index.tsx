import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { Headline } from "#/components/atoms/headline";
import { Popular } from "#/components/atoms/popular";
import { Main } from "#/components/atoms/main";

export const Route = createFileRoute("/")({});

export function HomePage() {
  return (
    <section className="w-full flex flex-col justify-center items-center">
      <div className="w-full primary-container relative flex flex-col lg:flex-row mb-[60px] px-[10px] lg:pl-[10px]">
        <div className="w-full lg:w-[710px] pt-[63px] md:pt-[160px] lg:pt-[150px]">
          <Suspense fallback={"Headline Wrapper "}>
            <Headline title="" />
          </Suspense>
        </div>
        <div className="h-full w-full lg:max-h-full lg:w-[380px] lg:pt-[174px]">
          <h2
            className="mx-auto max-w-[500px] pb-[20px] font-poly text-[15.75px] leading-[1.2] tracking-[0.005em]
          text-torq-100 md:pl-[60px] lg:pl-[40px]"
          >
            Top Stories By Categories
          </h2>
          <Suspense fallback={"Top Posts By Each Categories Wrapper"}>
            <Popular />
          </Suspense>
        </div>
      </div>

      <div className="pt-[28px] lg:pt-[40px] w-full flex flex-col justify-center items-center">
        <Suspense fallback={"Main Feed Wrapper"}>
          <Main />
        </Suspense>
      </div>
    </section>
  );
}
