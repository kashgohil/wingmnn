import { motion } from "motion/react";
import React from "react";

import { Form } from "@frameworks/forms/components/form";
import { useForm } from "@frameworks/forms/useForm";
import { useAccentSetup } from "@hooks/useAccentSetup";
import { Github } from "@icons/github";
import { Google } from "@icons/google";
import { ModulesConfig, type ModulesConfigKey } from "@navigation/config";
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
import { ArrowRight } from "lucide-react";
import { LandingFields } from "./fields";

export function Landing() {
  const [module, setModule] = React.useState<ModulesConfigKey>();

  useAccentSetup(module);

  const { name, description } = (module && ModulesConfig[module]) || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full h-full flex relative bg-black-500 gap-8"
    >
      <div
        className={cx(
          "h-full w-full flex items-center gap-8 transition-all duration-200 p-8",
          module ? "bg-accent/20" : "bg-black-100",
        )}
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
                  "group/list-item hover:bg-accent text-accent hover:text-[var(--accent-text)] outline-offset-4 outline-accent cursor-pointer flex items-center p-2 px-4 rounded-lg gap-2 w-full",
                  module === key
                    ? "bg-accent text-[var(--accent-text)] [&_svg]:text-[var(--accent-text)] hover:[&_svg]:text-[var(--accent-text)]"
                    : "",
                )}
              >
                <Icon className="text-accent" />
                <Typography.Paragraph className="font-semibold">
                  {config.description}
                </Typography.Paragraph>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col flex-1 h-full items-center justify-center gap-4">
          <motion.div
            layoutId="landing-header"
            className={cx("flex flex-col items-center w-full")}
          >
            <div
              className={cx(
                "flex flex-col items-center",
                module ? "w-1/6" : "w-1/2",
              )}
            >
              <CurvedText
                text="Wingmnn"
                fontSize={36}
                textColor="var(--accent)"
                fontFamily="var(--font-spicy-rice)"
              />
              <Typography.Text
                className={cx(
                  "text-accent/60 mb-4 text-center font-spicy-rice font-light",
                  module ? "text-xl" : "text-2xl",
                )}
              >
                your partner-in-crime
              </Typography.Text>
            </div>
            <LandingForm />
          </motion.div>
          <motion.div
            className={cx(
              "flex flex-col items-center justify-center",
              module ? "flex-1 m-8 rounded-lg w-1/2 overflow-hidden" : "h-0",
            )}
          >
            <Typography.H1 className="font-spicy-rice text-accent">
              {name}
            </Typography.H1>
            <Typography.H4>{description}</Typography.H4>
          </motion.div>
        </div>
      </div>
    </motion.div>
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
                className="w-full flex items-center justify-center space-x-4"
              >
                <Google size={16} />
                <Typography.Paragraph>Login with Google</Typography.Paragraph>
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
                className="w-full flex items-center justify-center space-x-4"
              >
                <Github size={16} />
                <Typography.Paragraph>Login with GitHub</Typography.Paragraph>
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
            <Typography.Paragraph>Let's get you in there</Typography.Paragraph>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
