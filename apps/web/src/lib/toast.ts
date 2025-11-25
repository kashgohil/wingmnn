/**
 * Toast utility - re-export from sonner for convenience
 * 
 * Usage:
 * ```tsx
 * import { toast } from "@/lib/toast";
 * 
 * toast("Hello world");
 * toast.success("Operation successful");
 * toast.error("Something went wrong");
 * toast("Event created", {
 *   description: "Sunday, December 03, 2023 at 9:00 AM",
 *   action: {
 *     label: "Undo",
 *     onClick: () => console.log("Undo"),
 *   },
 * });
 * ```
 */
export { toast } from "sonner";

