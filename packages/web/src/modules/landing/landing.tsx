import { Form } from "@frameworks/forms/components/form";
import { useForm } from "@frameworks/forms/useForm";
import { Github } from "@icons/github";
import { Google } from "@icons/google";
import { Box, Button, CurvedText, Separator } from "@wingmnn/components";
import { noop, reduce } from "@wingmnn/utils";
import { playMouseClickSound } from "@wingmnn/utils/interactivity";
import { motion } from "motion/react";
import { Content } from "./content";
import { LandingFields } from "./fields";

export function Landing() {
  const fields = LandingFields.loginFields();
  const fieldClassNames = reduce(
    fields,
    (accm, field) => {
      accm[field.id] = {
        wrapper: "focus-within:outline-black-200 border-black-200",
        content: "placeholder:!text-black-200/70",
      };
      return accm;
    },
    {} as TSAny,
  );

  const { formData } = useForm(fields);

  function form() {
    return (
      <Box className="sticky top-0 right-0 w-1/3 flex flex-col p-16 rounded-4xl overflow-hidden justify-center bg-white-200/70 text-black-500">
        <CurvedText
          text="Wingmnn"
          fontFamily="var(--font-spicy-rice)"
          fontSize={28}
          textColor="var(--color-black-500)"
        />
        <div className="text-2xl text-gray-700 mb-4 text-center font-spicy-rice font-light">
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
              className="w-full flex items-center justify-center bg-black-500 text-white-500 hover:bg-black-200 space-x-4 focus-within:outline-black-200"
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
              className="w-full flex items-center justify-center space-x-4 bg-black-500 text-white-500 hover:bg-black-200 focus-within:outline-black-200"
            >
              <Github size={16} />
              <span>Login with GitHub</span>
            </Button>
          </form>
        </div>
        <Separator content="OR" className="my-6 bg-white-950 rounded-lg" />

        <Form
          fields={fields}
          onChange={noop}
          onSubmit={noop}
          formData={formData}
          classes={fieldClassNames}
        />
        <Button
          size="sm"
          className="w-full mt-6 bg-black-500 text-white-500 hover:bg-black-200 focus-within:outline-black-200"
        >
          Let's get you in there
        </Button>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full h-full flex p-8 relative bg-black-500 gap-8"
    >
      <Content />
      {form()}
    </motion.div>
  );
}
