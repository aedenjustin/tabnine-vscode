import { ExtensionContext, TextEditor } from "vscode";
import { Logger } from "../../../utils/logger";
import { rejectOnTimeout } from "../../../utils/utils";
import executeWorkspaceCommand, {
  WorkspaceCommandInstruction,
} from "../../workspaceCommands";
import { ContextTypeData, WorkspaceContext } from "./enrichingContextTypes";

export default async function getWorkspaceContext(
  workspaceCommands: WorkspaceCommandInstruction[] | undefined,
  editor: TextEditor,
  context: ExtensionContext | undefined
): Promise<ContextTypeData | undefined> {
  if (!workspaceCommands || !workspaceCommands.length) return undefined;

  const workspaceData: WorkspaceContext = {
    symbols: undefined,
  };

  try {
    const results = await rejectOnTimeout(
      Promise.all(
        workspaceCommands.map((command) =>
          executeWorkspaceCommand(command, editor, context)
        )
      ),
      250000
    );

    results.forEach((result) => {
      if (!result) return;
      if (result.command === "findSymbols") {
        workspaceData.symbols = (workspaceData?.symbols ?? []).concat(
          result.data
        );
      }
    });

    return { type: "Workspace", ...workspaceData };
  } catch (error) {
    Logger.warn(
      `failed to obtain workspace context, continuing without it: ${
        (error as Error).message
      }`
    );
    return undefined;
  }
}
