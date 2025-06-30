import { Form } from "@frameworks/forms/components/form";
import { useForm } from "@frameworks/forms/useForm";
import { Github } from "@icons/github";
import { Google } from "@icons/google";
import {
  ExcludedModules,
  ModulesConfig,
  type ModulesConfigKey,
} from "@navigation/config";
import {
  Button,
  CurvedText,
  cx,
  Dialog,
  DialogContent,
  Separator,
  Typography,
} from "@wingmnn/components";
import { mapObj, noop, reduce } from "@wingmnn/utils";
import { useBoolean } from "@wingmnn/utils/hooks";
import { playMouseClickSound } from "@wingmnn/utils/interactivity";
import { ArrowRight } from "lucide-react";
import React from "react";
import { LandingFields } from "./fields";

export function Content(props: React.PropsWithChildren) {
  const [module, setModule] = React.useState("");

  const { accent, accentText } = React.useMemo(() => {
    if (!module)
      return {
        accent: "var(--color-black-500)",
        accentText: "var(--color-white-500)",
      };
    if (ExcludedModules.includes(module as TSAny))
      return {
        accent: "var(--color-black-500)",
        accentText: "var(--color-white-500)",
      };
    const config = ModulesConfig[module as ModulesConfigKey];
    return { accent: config.accent, accentText: config.accentText };
  }, [module]);

  React.useEffect(() => {
    let {
      accent = "var(--color-white-100)",
      accentText = "var(--color-white-500)",
    } = ModulesConfig[module as ModulesConfigKey] || {};

    if (ExcludedModules.includes(module as TSAny)) {
      accent = "var(--color-white-100)";
      accentText = "var(--color-white-500)";
    }

    document.body.style.setProperty("--accent", accent);
    document.body.style.setProperty("--accent-text", accentText);
  }, [module]);

  return (
    <div
      className="h-full w-full flex items-center gap-8 bg-accent/20 transition-all duration-200 p-8"
      style={{ "--accent": accent, "--accent-text": accentText } as TSAny}
    >
      <div className="sticky left-0 flex flex-col items-start gap-2">
        {mapObj(ModulesConfig, (config, key) => {
          const {
            accentText,
            accent,
            icon: Icon,
            placement,
            disabled,
          } = config;

          if (disabled) return null;
          if (placement === "bottom") return null;

          return (
            <div
              key={key}
              tabIndex={0}
              onMouseOver={() => setModule(key)}
              style={
                { "--accent": accent, "--accent-text": accentText } as TSAny
              }
              className={cx(
                "group/list-item hover:bg-accent text-accent hover:text-[var(--accent-text)] outline-offset-4 outline-accent cursor-pointer flex items-center space-x-2 p-2 px-4 rounded-lg gap-2 w-full",
                module === key
                  ? "bg-accent text-[var(--accent-text)] [&_svg]:text-[var(--accent-text)]"
                  : "",
              )}
            >
              <Icon className="text-accent group-hover/list-item:text-[var(--accent-text)]" />
              <Typography.Paragraph className="font-semibold">
                {config.description}
              </Typography.Paragraph>
            </div>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <CurvedText
          text="Wingmnn"
          fontFamily="var(--font-spicy-rice)"
          fontSize={16}
          textColor="var(--accent)"
        />
        <div className="text-2xl text-accent/60 -translate-y-12 mb-4 text-center font-spicy-rice font-light">
          your partner-in-crime
        </div>
        <LandingForm />
      </div>
    </div>
  );
}

function LandingForm() {
  const fields = LandingFields.loginFields();
  const fieldClassNames = reduce(
    fields,
    (accm, field) => {
      accm[field.id] = {
        wrapper: "",
        content: "",
      };
      return accm;
    },
    {} as TSAny,
  );

  const { value, toggle } = useBoolean(false);

  const { formData } = useForm(fields);

  return (
    <>
      <Button size="sm" onClick={toggle}>
        <div className="flex items-center gap-2">
          <span>Get in there</span>
          <ArrowRight size={20} />
        </div>
      </Button>
      <Dialog open={value} onClose={toggle}>
        <DialogContent className="flex flex-col !p-18 rounded-lg overflow-hidden justify-center bg-black-100">
          <CurvedText
            text="Wingmnn"
            fontFamily="var(--font-spicy-rice)"
            fontSize={24}
            textColor="var(--accent)"
          />
          <div className="text-2xl text-accent/80 mb-4 text-center font-spicy-rice font-light">
            your partner-in-crime
          </div>
          <div className="flex items-center space-x-4 mt-8">
            <form
              method="post"
              className="w-full"
              action="http://localhost:8001/auth/sso/google"
            >
              <input name="connectionName" readOnly value="google" hidden />
              <Button
                size="sm"
                type="submit"
                onMouseDown={playMouseClickSound}
                className="w-full flex items-center justify-center space-x-4"
              >
                <Google size={16} />
                <span>Login with Google</span>
              </Button>
            </form>
            <form
              method="post"
              className="w-full"
              action="localhost:8001/auth/sso/github"
            >
              <input name="connectionName" readOnly value="github" hidden />
              <Button
                size="sm"
                type="submit"
                onMouseDown={playMouseClickSound}
                className="w-full flex items-center justify-center space-x-4"
              >
                <Github size={16} />
                <span>Login with GitHub</span>
              </Button>
            </form>
          </div>
          <Separator
            content="OR"
            contentClassName="text-accent"
            className="my-6 bg-accent/40 rounded-lg !text-[var(--accent-text)]"
          />

          <Form
            fields={fields}
            onChange={noop}
            onSubmit={noop}
            formData={formData}
            classes={fieldClassNames}
          />
          <Button size="sm" className="w-full mt-6">
            Let's get you in there
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
