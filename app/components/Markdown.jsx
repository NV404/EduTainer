import { renderers, transform, parse } from "@markdoc/markdoc";
import * as React from "react";

export function Markdown({ content }) {
  return (
    <div className="prose">
      {renderers.react(transform(parse(content)), React)}
    </div>
  );
}
