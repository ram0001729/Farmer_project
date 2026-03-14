import React from "react";
import { useTranslation } from "react-i18next";

function AutoTranslate({ children }) {
  const { t } = useTranslation();

  const translate = (node) => {
    if (typeof node === "string") {
      return t(node);
    }

    if (Array.isArray(node)) {
      return node.map(translate);
    }

    if (React.isValidElement(node)) {
      return React.cloneElement(node, {
        children: translate(node.props.children),
      });
    }

    return node;
  };

  return <>{translate(children)}</>;
}

export default AutoTranslate;
