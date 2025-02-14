import { Box } from "@components/box/box";
import { Button } from "@components/button/button";
import { Separator } from "@components/separator/separator";
import { Form } from "@frameworks/forms/components/form";
import { useForm } from "@frameworks/forms/useForm";
import { Github } from "@icons/github";
import { Google } from "@icons/google";
import { Wingmnn } from "@icons/wingmnn";
import { noop } from "@utility/noop";
import { LandingFields } from "./fields";

export function Landing() {
  const fields = LandingFields.loginFields();

  const { formData } = useForm(fields);

  function form() {
    return (
      <Box className="w-1/3 flex flex-col p-16 rounded-4xl justify-center bg-white-200/70 text-black absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-lg">
        <div className="text-5xl mb-2 text-center">wingmnn</div>
        <div className="text-2xl text-black-50 mb-4 text-center">
          your partner-in-crime
        </div>
        <div className="flex items-center space-x-4 mt-8">
          <form
            method="post"
            className="w-full"
            action="http://localhost:3000/auth/sso/google"
          >
            <input name="connectionName" value="google" hidden />
            <Button
              size="sm"
              type="submit"
              className="w-full flex items-center justify-center space-x-4"
            >
              <Google size={16} />
              <span>Login with Google</span>
            </Button>
          </form>
          <form
            method="post"
            className="w-full"
            action="localhost:3000/auth/sso/github"
          >
            <input name="connectionName" value="github" hidden />
            <Button
              size="sm"
              type="submit"
              className="w-full flex items-center justify-center space-x-4"
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
        />
        <Button size="sm" className="w-full mt-6">
          Let's get you in there
        </Button>
      </Box>
    );
  }

  return (
    <div className="w-full h-full flex bg-black p-8 relative">
      <div className="flex flex-col h-full items-center justify-center flex-1">
        <Wingmnn height={"70%"} className="animate-slow-spin" />
      </div>
      {form()}
    </div>
  );
}
