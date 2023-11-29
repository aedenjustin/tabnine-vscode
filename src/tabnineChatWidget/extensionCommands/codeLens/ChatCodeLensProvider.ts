import { CodeLens, CodeLensProvider, Location, TextDocument } from "vscode";
import { fireEvent } from "../../../binary/requests/requests";
import { getFuctionsSymbols } from "../getFuctionsSymbols";

const CODE_LENS_ACTIONS = [
  ["test", "generate-test-for-code"],
  ["fix", "fix-code"],
  ["explain", "explain-code"],
];

const MAX_LINES = 2500;

export default class ChatCodeLensProvider implements CodeLensProvider {
  // eslint-disable-next-line class-methods-use-this
  public async provideCodeLenses(
    document: TextDocument
  ): Promise<CodeLens[] | undefined> {
    if (document.lineCount > MAX_LINES) {
      return [];
    }

    const documnetSymbols = await getFuctionsSymbols(document);

    if (!documnetSymbols?.length) {
      return [];
    }

    const lenses: CodeLens[] = [];

    documnetSymbols.forEach(({ location }) => {
      lenses.push(...toIntentLens(location), toAskLens(location));
    });

    void fireEvent({
      name: "chat-lens-label-rendered",
      language: document.languageId,
      labelsCount: lenses.length,
    });

    return lenses;
  }
}

function toAskLens(location: Location): CodeLens {
  return new CodeLens(location.range, {
    title: `ask`,
    tooltip: `tabnine ask`,
    command: "tabnine.chat.commands.ask",
    arguments: [location.range],
  });
}

function toIntentLens(location: Location) {
  return CODE_LENS_ACTIONS.map(
    ([text, action], index) =>
      new CodeLens(location.range, {
        title: `${index === 0 ? "tabnine: " : ""}${text}`,
        tooltip: `tabnine ${text}`,
        command: "tabnine.chat.commands.any",
        arguments: [location.range, action],
      })
  );
}
