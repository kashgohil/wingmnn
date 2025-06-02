import { IconButton } from "@components/iconButton/iconButton";
import { cx } from "@utility/cx";
import { click } from "@wingmnn/utils/interactivity";
import { type LucideIcon, UploadIcon, X } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import React, { type ChangeEvent } from "react";

interface UploadProps extends HTMLMotionProps<"div"> {
  accept?: string;
  message?: string;
  icon?: LucideIcon;
  attachment?: Attachment;
  onUpload: (files: Array<File>) => void;
  onRemove: (attachment: Attachment) => void;
}

interface AttachmentProps {
  attachment: Attachment;
  onRemove(attachment: Attachment): void;
}

function Attachment(props: AttachmentProps) {
  const { attachment, onRemove } = props;
  const { contentType, thumbnailUrl, url, name, description } = attachment;

  if (contentType.startsWith("image")) {
    return (
      <div className="h-full w-full relative">
        <img
          alt={name}
          src={thumbnailUrl || url}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          onClick={() => onRemove(attachment)}
          iconProps={{ height: 14, width: 14 }}
          className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 p-1"
        />
      </div>
    );
  }

  if (contentType.startsWith("video")) {
    return (
      <div className="h-full w-full relative">
        <video
          controls
          src={url}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          size="sm"
          onClick={() => onRemove(attachment)}
          className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    );
  }

  if (contentType.startsWith("audio")) {
    return (
      <div className="h-full w-full relative">
        <audio
          controls
          src={url}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          size="sm"
          onClick={() => onRemove(attachment)}
          className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center text-center">
      <div className="text-xl">{name}</div>
      <div className="text-white-950 text-sm">{description}</div>
      <IconButton
        icon={X}
        size="sm"
        onClick={() => onRemove(attachment)}
        className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

interface FileProps {
  file: File;
  onRemove: (file: File) => void;
}

function File(props: FileProps) {
  const { file, onRemove } = props;
  const { type, name, size } = file;

  const [url, setUrl] = React.useState<string>("");

  React.useEffect(() => {
    const fileContent = new FileReader();
    fileContent.onload = () => {
      setUrl(fileContent.result as string);
    };
    fileContent.readAsDataURL(file);
  }, [file]);

  if (type.startsWith("image")) {
    return (
      <div className="h-full w-full relative">
        <motion.img
          src={url}
          alt={name}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          shape="circle"
          variant="secondary"
          onClick={() => onRemove(file)}
          iconProps={{ height: 12, width: 12 }}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-0.5"
        />
      </div>
    );
  }

  if (type.startsWith("video")) {
    return (
      <div className="h-full w-full relative">
        <motion.video
          controls
          src={url}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          shape="circle"
          variant="secondary"
          onClick={() => onRemove(file)}
          iconProps={{ height: 12, width: 12 }}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-0.5"
        />
      </div>
    );
  }

  if (type.startsWith("audio")) {
    return (
      <div className="h-full w-full relative">
        <motion.audio
          controls
          src={url}
          className="w-full h-full object-cover rounded-lg"
        />
        <IconButton
          icon={X}
          shape="circle"
          variant="secondary"
          onClick={() => onRemove(file)}
          iconProps={{ height: 12, width: 12 }}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-0.5"
        />
      </div>
    );
  }

  return (
    <motion.div className="h-full w-full relative flex flex-col items-center justify-center text-center flex-1">
      <div className="text-xl">{name}</div>
      <div className="text-white-950 text-sm">{size} bytes</div>

      <IconButton
        icon={X}
        size="sm"
        shape="circle"
        variant="secondary"
        onClick={() => onRemove(file)}
        iconProps={{ height: 12, width: 12 }}
        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-0.5"
      />
    </motion.div>
  );
}

export function Upload(props: UploadProps) {
  const {
    onRemove,
    className,
    attachment,
    accept,
    icon: Icon = UploadIcon,
    message = "Bring in your files!",
    ...rest
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<ExtendedFile>();

  const fileHandler = React.useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file: TSAny = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        file.url = reader.result as string;
        setFile(file);
      };
    },
    [],
  );

  function content() {
    if (attachment) {
      return <Attachment attachment={attachment} onRemove={onRemove} />;
    } else if (file) {
      return <File file={file} onRemove={() => setFile(undefined)} />;
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Icon />
          <p className="text-white-500 text-sm mt-2">{message}</p>
          <input
            hidden
            type="file"
            ref={inputRef}
            accept={accept}
            onChange={fileHandler}
          />
        </div>
      );
    }
  }

  return (
    <motion.div
      {...rest}
      tabIndex={0}
      animate={{ height: "auto" }}
      onClick={() => inputRef.current?.click()}
      onKeyPress={click(() => inputRef.current?.click())}
      className={cx(
        "flex flex-col items-center justify-center border border-dashed border-white-950 w-full min-h-24 rounded-lg focus-within:outline-dashed focus-within:outline-2 focus-within:outline-white-500 focus-within:outline-offset-2 focus-within:border-transparent transition-all duration-100 cursor-pointer relative p-3",
        className,
      )}
    >
      <AnimatePresence>{content()}</AnimatePresence>
    </motion.div>
  );
}
