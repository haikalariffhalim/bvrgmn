import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const listAllBadge = query({
  args: {},
  handler: async (ctx, args) => {
    return {
      kipas: v.id("kipas"),
      ulatbuku: v.id("ulatbuku"),
      askar: v.id("askar"),
      tentera: v.id("tentera"),
      yapper: v.id("yapper"),
      penyebar: v.id("penyebar"),
      kakiselam: v.id("selam"),
      brader: v.id("brader"),
      nightsWatch: v.id("nightsWatch"),
      taiko: v.id("taiko"),
      tailong: v.id("tailong"),
      sifoo: v.id("sifoo"),
      dato: v.id("dato"),
      ayahnda: v.id("ayahanda"),
      panglima: v.id("panglima"),
      museum: v.id("museum"),
      karat: v.id("karat"),
      berhabuk: v.id("berhabuk"),
      bersawang: v.id("bersawang"),
      geng: v.id("geng"),
      bawang: v.id("bawang"),
      penggemar: v.id("penggemar"),
      pengulas: v.id("pengulas"),
      detektif: v.id("detektif"),
      ahlidewan: v.id("ahlidewan"),
      kenabare: v.id("kenabare"),
      sus: v.id("sus"),
    };
  },
});
