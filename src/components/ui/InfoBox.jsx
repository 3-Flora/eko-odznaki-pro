import clsx from "clsx";
import { CircleAlert } from "lucide-react";
import React from "react";

export default function InfoBox({ icon, style = "info", children }) {
  const infoBoxStyles = {
    info: {
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-400",
      titleColor: "text-blue-800 dark:text-blue-200",
      listTextColor: "text-blue-700 dark:text-blue-300",
    },
    warning: {
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-400",
      titleColor: "text-amber-800 dark:text-amber-200",
      listTextColor: "text-amber-700 dark:text-amber-300",
    },
  };

  let childrenArray = Array.isArray(children) ? children : [children];

  let iconElement = null;
  if (icon) {
    if (React.isValidElement(icon)) {
      iconElement = icon;
    } else if (typeof icon === "function") {
      const IconComp = icon;
      iconElement = <IconComp />;
    }
  } else {
    // Jeśli brak prop.icon, pozwól przekazać ikonę jako pierwszy child (np. <School />)
    const firstChild = childrenArray[0];
    if (
      firstChild &&
      React.isValidElement(firstChild) &&
      firstChild.type !== "h3" &&
      firstChild.type !== "ul" &&
      firstChild.type !== "li"
    ) {
      iconElement = firstChild;
      childrenArray = childrenArray.slice(1); // usuń ikonę z dalszego przetwarzania children
    }
  }

  const firstH3 = childrenArray.find((ch) => ch && ch.type === "h3");

  const liItems = [];
  childrenArray.forEach((ch) => {
    if (!ch) return;
    if (ch.type === "li") {
      liItems.push(ch);
      return;
    }
    if (ch.type === "ul" && ch.props && ch.props.children) {
      React.Children.toArray(ch.props.children).forEach((c) => {
        if (c && c.type === "li") liItems.push(c);
      });
      return;
    }
    if (ch.props && ch.props.children) {
      React.Children.toArray(ch.props.children).forEach((inner) => {
        if (!inner) return;
        if (inner.type === "li") {
          liItems.push(inner);
        } else if (inner.type === "ul" && inner.props && inner.props.children) {
          React.Children.toArray(inner.props.children).forEach((li) => {
            if (li && li.type === "li") liItems.push(li);
          });
        }
      });
    }
  });

  // Jeśli mamy element ikony, dołącz odpowiednie klasy (klonując element)
  if (iconElement) {
    const existingClass = iconElement.props?.className || "";
    iconElement = React.cloneElement(iconElement, {
      className: clsx("h-5 w-5", infoBoxStyles[style].iconColor, existingClass),
    });
  }

  return (
    <div className={clsx("mt-6 rounded-xl p-4", infoBoxStyles[style].bgColor)}>
      <div className="">
        <div className="flex gap-3">
          {iconElement ? (
            iconElement
          ) : (
            <CircleAlert
              className={clsx("h-5 w-5", infoBoxStyles[style].iconColor)}
            />
          )}
          <h3
            className={clsx(
              "text-sm font-medium",
              infoBoxStyles[style].titleColor,
            )}
          >
            {firstH3 ? firstH3.props.children : null}
          </h3>
        </div>
        <div>
          <div
            className={clsx("mt-2 text-sm", infoBoxStyles[style].listTextColor)}
          >
            <ul className="list-inside list-disc space-y-1">
              {liItems.length > 0
                ? liItems.map((li, idx) => (
                    <li key={idx}>{li.props.children}</li>
                  ))
                : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
