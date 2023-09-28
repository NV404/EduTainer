const PADDINGS = {
  small: "py-1.5 px-3",
  medium: "py-1.5 px-5",
};

const THEMES = {
  none: "",
  plain: "bg-transparent text-black hover:shadow-none hover:bg-black/10",
  primary: "bg-black text-white",
  outline: "border border-black text-black",
  yellow: "bg-yellow-400 text-black",
  red: "bg-red-500 text-white",
};

// appearance-none

export default function Button({
  as: As = "button",
  children,
  theme = "primary",
  size = "medium",
  round = true,
  className = "",
  ...otherProps
}) {
  return (
    <As
      className={[
        PADDINGS[size],
        round ? "rounded-xl" : "",
        "inline-flex hover:shadow-xl transition-all duration-300 justify-center items-center group space-x-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        THEMES[theme],
        className,
      ].join(" ")}
      {...otherProps}
    >
      {children}
    </As>
  );
}
