const buildspec = require("./thunder.json");
const { exec } = require("child_process");
const glob = require("glob");
const fs = require("fs");
const path = require("path");

/**
 * @param {string} originalFileName
 */
function createFlatFileName(originalFileName) {
  return originalFileName.replace(/[_]/g, "__").replace(/[ \:\/\\]/g, "_");
}

/**
 * @param {string} originalFileName
 */
function createNamespaceName(originalFileName) {
  return (
    "__thunder_file_" +
    originalFileName.replace(/[_\.]/g, "__").replace(/[ \:\/\\\.\-]/g, "_")
  );
}

class Stream {
  /** @type {string} */
  buffer;
  constructor(content) {
    this.content = content;
    this.buffer = content;
  }
  readLine() {
    const line = this.readUntil("\n");
    this.readQuantity(1);
    return line;
  }
  readQuantity(count) {
    const read = this.buffer.slice(0, count);
    this.buffer = this.buffer.slice(count);
    return read;
  }
  /** @param {string} string */
  readUntil(string) {
    const index = this.buffer.indexOf(string);
    if (index === -1) {
      this.buffer = "";
      return this.buffer;
    } else {
      const line = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index);
      return line;
    }
  }
  hasMore() {
    return this.buffer.length > 0;
  }
}

class Builder {
  constructor(buildspec) {
    const sourceFiles = [];

    buildspec.executables.displayimage.sourceFiles.forEach((pattern) => {
      const filenames = glob.sync(pattern);
      if (filenames.length === 0) {
        console.error("[error] file not found matching pattern:", pattern);
      } else {
        sourceFiles.push.apply(sourceFiles, filenames);
      }
    });

    this.folderRoot = __dirname;
    this.sourceFiles = sourceFiles.map((file) =>
      path.join(this.folderRoot, file)
    );
    this.currentlyExecuting = null;
    this.commandQueue = [];
  }
  __exec(command) {
    if (this.currentlyExecuting) {
      this.commandQueue.push(command);
    } else {
      console.log("executing", command);
      const e = exec(command);
      this.currentlyExecuting = e;
      e.stdout.on("data", (data) => {
        console.log("[info]", data);
      });
      e.stderr.on("data", (data) => {
        console.log("[error]", data);
      });
      e.on("exit", () => {
        this.currentlyExecuting = null;
        if (this.commandQueue.length > 0) {
          const [command, ...rest] = this.commandQueue;
          this.commandQueue = rest;
          if (command) {
            this.__exec(command);
          }
        }
      });
    }
  }
  /**
   *
   * @param {string} sourceFilePath The file that the path was found in
   * @param {string} importedFilePath The name that was imported (e.g. "opencv/hello.hpp")
   */
  __createImportPath(sourceFilePath, importedFilePath) {
    if (
      importedFilePath.startsWith("./") ||
      importedFilePath.startsWith("../")
    ) {
      return (
        "../header/" +
        createFlatFileName(
          path.join(path.dirname(sourceFilePath), importedFilePath)
        ) +
        ".hpp"
      );
    } else {
      return (
        "../header/" +
        createFlatFileName(
          path.join(this.folderRoot, "./thunder_modules/", importedFilePath) +
            ".hpp"
        )
      );
    }
  }
  __createImportNamespaceName(sourceFilePath, importedFilePath) {
    if (
      importedFilePath.startsWith("./") ||
      importedFilePath.startsWith("../")
    ) {
      return createNamespaceName(
        path.join(path.dirname(sourceFilePath), importedFilePath)
      );
    } else {
      return createNamespaceName(
        path.join(this.folderRoot, "thunder_modules", importedFilePath)
      );
    }
  }
  __translate(sourceFiles) {
    const translateOutputFiles = [];
    for (let sourceFile of sourceFiles) {
      const flatFileName = createFlatFileName(sourceFile);
      const fileContent = fs.readFileSync(sourceFile, { encoding: "utf-8" });
      let newFileContent = "";
      const stream = new Stream(fileContent);
      const headers = [];
      const PRIVATE_NAMESPACE_START = `namespace ${createNamespaceName(
        sourceFile
      )} {\n`;
      const PRIVATE_NAMESPACE_END = `}/*end private namespace*/\n`;
      const EXPORT_NAMESPACE_START = `namespace exports {\n`;
      const EXPORT_NAMESPACE_END = `}/*end export*/\n`;
      const importMap = {};
      let isInPrivateNamespace = false;
      let isInExportNamespace = false;
      let isInGlobal = false;

      const startPrivateNamespace = () => {
        isInPrivateNamespace = true;
        newFileContent += PRIVATE_NAMESPACE_START;
      };

      const endPrivateNamespace = () => {
        isInPrivateNamespace = false;
        newFileContent += PRIVATE_NAMESPACE_END;
      };

      const startExportNamespace = () => {
        isInExportNamespace = true;
        newFileContent += EXPORT_NAMESPACE_START;
      };

      const endExportNamespace = () => {
        isInExportNamespace = false;
        newFileContent += EXPORT_NAMESPACE_END;
      };

      const exitAllNamespaces = () => {
        if (isInPrivateNamespace) {
          endPrivateNamespace();
        }
        if (isInExportNamespace) {
          endExportNamespace();
        }
      };

      while (stream.hasMore()) {
        const line = stream.readLine();
        const importMatch = line.match(/@import \"(.+)\" as (\w+)/);

        console.log({
          line,
          isInExportNamespace,
          isInPrivateNamespace,
          isInGlobal,
        });

        if (line.startsWith("#include")) {
          exitAllNamespaces();
          newFileContent += line;
        } else if (importMatch != null) {
          exitAllNamespaces();

          const importedFilePath = importMatch[1];
          const importAlias = importMatch[2];
          const importedResolvedFilePath = this.__createImportPath(
            sourceFile,
            importedFilePath
          );
          const importNamespaceName = this.__createImportNamespaceName(
            sourceFile,
            importedFilePath
          );
          newFileContent += `#include "${importedResolvedFilePath}"\n`;
          newFileContent += `#define ${importAlias} ${importNamespaceName}::exports\n`;
        } else if (line.startsWith("@global")) {
          exitAllNamespaces();
          isInGlobal = true;
        } else if (line.startsWith("@endglobal")) {
          startPrivateNamespace();
          isInGlobal = false;
        } else {
          if (!isInExportNamespace && !isInPrivateNamespace && !isInGlobal) {
            startPrivateNamespace();
          }

          if (line.match("@export")) {
            startExportNamespace();

            const methodDefinition = stream.readUntil("{");
            headers.push(methodDefinition);
            newFileContent += methodDefinition;
          } else if (line.match("@endexport")) {
            endExportNamespace();
          } else {
            let replacedLine = line;
            for (let [alias, replacement] of Object.entries(importMap)) {
              replacedLine = replacedLine.replace(
                alias + "::",
                replacement + "::"
              );
            }
            newFileContent += replacedLine + "\n";
          }
        }
      }

      if (isInExportNamespace) {
        endExportNamespace();
      } else if (isInPrivateNamespace) {
        endPrivateNamespace();
      }

      console.log("found headers:", headers);

      const translateOutputFileName = `thunder_internal/translate/${flatFileName}`;
      const headerOutputFileName = `thunder_internal/header/${flatFileName}.hpp`;

      // Include header file
      newFileContent =
        `#include "../../${headerOutputFileName}"\n` + newFileContent;

      fs.writeFileSync(translateOutputFileName, newFileContent, {
        encoding: "utf-8",
      });

      fs.writeFileSync(
        headerOutputFileName,
        PRIVATE_NAMESPACE_START +
          EXPORT_NAMESPACE_START +
          [...headers, ""].join(";") +
          EXPORT_NAMESPACE_END +
          PRIVATE_NAMESPACE_END,
        {
          encoding: "utf-8",
        }
      );

      translateOutputFiles.push(translateOutputFileName);
    }

    return translateOutputFiles;
  }
  __compile(sourceFiles) {
    for (let sourceFile of sourceFiles) {
      const objectFileName = `thunder_internal/obj/${createFlatFileName(
        sourceFile
      )}.o`;

      const translatedFileName = `thunder_internal/translate/${createFlatFileName(
        sourceFile
      )}`;

      console.info("Compiling", translatedFileName, "to", objectFileName);

      this.__exec(`g++ -c ${translatedFileName} -o ${objectFileName}`);
    }
  }
  __build(objectFiles, outfileName) {
    this.__exec(
      `g++ -o thunder_builds/${outfileName} ${objectFiles.join(" ")}`
    );
  }
  build() {
    this.__translate(this.sourceFiles);
    this.__compile(this.sourceFiles);
    const objectFiles = this.sourceFiles.map(
      (f) => `thunder_internal/obj/${createFlatFileName(f)}.o`
    );
    console.info("Building", objectFiles);
    this.__build(objectFiles, "hello");
  }
}

const builder = new Builder(buildspec);

builder.build();
