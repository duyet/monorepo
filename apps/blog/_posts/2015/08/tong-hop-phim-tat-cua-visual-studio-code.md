---
title: Tổng hợp phím tắt của Visual Studio Code
date: '2015-08-07'
author: Duyet
tags:
  - VS Code
  - Tutorial
modified_time: '2015-08-07T21:10:50.024+07:00'
thumbnail: https://2.bp.blogspot.com/-FGeqqi-Oxuk/VcS8Ssfh-FI/AAAAAAAACsY/U9P4bj2vfhI/s1600/VS_Code_Ubntu_duyetdev.com.png
slug: /2015/08/tong-hop-phim-tat-cua-visual-studio-code.html
category: News
description: Tổng hợp lại một số phím tắt hay, hay dùng của VS Code.
---

Tổng hợp lại một số phím tắt hay, hay dùng của VS Code.

![](https://2.bp.blogspot.com/-FGeqqi-Oxuk/VcS8Ssfh-FI/AAAAAAAACsY/U9P4bj2vfhI/s1600/VS_Code_Ubntu_duyetdev.com.png)

## Shortcuts - Basic Editing

| Key                 | Command                                     | Command id                                 |
| ------------------- | ------------------------------------------- | ------------------------------------------ |
| Ctrl+Shift+K        | Delete Line                                 | editor.action.deleteLines                  |
| Ctrl+Enter          | Insert Line Below                           | editor.action.insertLineAfter              |
| Ctrl+Shift+Enter    | Insert Line Above                           | editor.action.insertLineBefore             |
| Ctrl+Down           | Move Line Down                              | editor.action.moveLinesDownAction          |
| Ctrl+Up             | Move Line Up                                | editor.action.moveLinesUpAction            |
| Ctrl+Shift+Alt+Down | Copy Line Down                              | editor.action.copyLinesDownAction          |
| Ctrl+Shift+Alt+Up   | Copy Line Up                                | editor.action.copyLinesUpAction            |
| Ctrl+D              | Add Selection To Next Find Match            | editor.action.addSelectionToNextFindMatch  |
| Ctrl+K Ctrl+D       | Move Last Selection To Next Find Match      | editor.action.moveSelectionToNextFindMatch |
| Ctrl+U              | Undo last cursor operation                  | cursorUndo                                 |
| Ctrl+Shift+L        | Select all occurrences of current selection | editor.action.selectHighlights             |
| Ctrl+F2             | Select all occurrences of current word      | editor.action.changeAll                    |
| Ctrl+Meta+Down      | Insert Cursor Below                         | editor.action.insertCursorBelow            |
| Ctrl+Meta+Up        | Insert Cursor Above                         | editor.action.insertCursorAbove            |
| Ctrl+Shift+]        | Jump to matching bracket                    | editor.action.jumpToBracket                |
| Ctrl+]              | Indent Line                                 | editor.action.indentLines                  |
| Ctrl+[              | Outdent Line                                | editor.action.outdentLines                 |
| Home                | Go to Beginning of Line                     | cursorHome                                 |
| End                 | Go to End of Line                           | cursorEnd                                  |
| Ctrl+End            | Go to End of File                           | cursorBottom                               |
| Ctrl+Home           | Go to Beginning of File                     | cursorTop                                  |
| Ctrl+K Ctrl+C       | Add Line Comment                            | editor.action.addCommentLine               |
| Ctrl+K Ctrl+U       | Remove Line Comment                         | editor.action.removeCommentLine            |
| Ctrl+/              | Toggle Line Comment                         | editor.action.commentLine                  |
| Ctrl+Shift+A        | Toggle Block Comment                        | editor.action.blockComment                 |
| Ctrl+F              | Find                                        | actions.find                               |
| Ctrl+H              | Replace                                     | editor.action.startFindReplaceAction       |
| F3                  | Find Next                                   | editor.action.nextMatchFindAction          |
| Shift+F3            | Find Previous                               | editor.action.previousMatchFindAction      |
| Ctrl+M              | Toggle Use of Tab Key for Setting Focus     | editor.action.toggleTabFocusMode           |

## Shortcuts - Rich Languages Editing

| Key             | Command                     | Command id                            |
| --------------- | --------------------------- | ------------------------------------- |
| Ctrl+Space      | Trigger Suggest             | editor.action.triggerSuggest          |
| Ctrl+Shift+I    | Format Code                 | editor.action.format                  |
| F12             | Go to Definition            | editor.action.goToDeclaration         |
| Ctrl+Shift+F10  | Peek Definition             | editor.action.previewDeclaration      |
| Ctrl+.          | Quick Fix                   | editor.action.quickFix                |
| Shift+F12       | Show References             | editor.action.referenceSearch.trigger |
| F2              | Rename Symbol               | editor.action.rename                  |
| Ctrl+Shift+.    | Replace with Next Value     | editor.action.inPlaceReplace.down     |
| Ctrl+Shift+,    | Replace with Previous Value | editor.action.inPlaceReplace.up       |
| Shift+Alt+Right | Expand AST Select           | editor.action.smartSelect.grow        |
| Shift+Alt+Left  | Shrink AST Select           | editor.action.smartSelect.shrink      |

## Shortcuts - Navigation

| Key          | Command                         | Command id                          |
| ------------ | ------------------------------- | ----------------------------------- |
| Ctrl+T       | Show All Symbols                | workbench.action.showAllSymbols     |
| Ctrl+G       | Go to Line...                   | workbench.action.gotoLine           |
| Ctrl+P       | Go to File...                   | workbench.action.quickOpen          |
| Ctrl+Shift+O | Go to Symbol...                 | workbench.action.gotoSymbol         |
| Ctrl+Shift+M | Show Errors and Warnings        | workbench.action.showErrorsWarnings |
| F8           | Go to Next Error or Warning     | editor.action.marker.next           |
| Shift+F8     | Go to Previous Error or Warning | editor.action.marker.prev           |
| Ctrl+Shift+P | Show All Commands               | workbench.action.showCommands       |
| Ctrl+Tab     | Navigate History                | workbench.action.openPreviousEditor |
| Ctrl+Alt+-   | Go Back                         | workbench.action.navigateBack       |
| Ctrl+Shift+- | Go Forward                      | workbench.action.navigateForward    |

## Shortcuts - Editor/Window Management

| Key                  | Command                             | Command id                         |
| -------------------- | ----------------------------------- | ---------------------------------- |
| Ctrl+Shift+N         | New Window                          | workbench.action.newWindow         |
| Ctrl+Shift+W         | Close Window                        | workbench.action.closeWindow       |
| Ctrl+W               | Close Editor                        | workbench.action.closeActiveEditor |
| Ctrl+\`              | Cycle Between Opened Editors        | workbench.action.cycleEditor       |
| Ctrl+\               | Split Editor                        | workbench.action.splitEditor       |
| Ctrl+1               | Focus into Left Hand Editor         | workbench.action.focusFirstEditor  |
| Ctrl+2               | Focus into Side Editor              | workbench.action.focusSecondEditor |
| Ctrl+3               | Focus into Right Hand Editor        | workbench.action.focusThirdEditor  |
| Ctrl+Shift+Alt+Left  | Focus into Next Editor on the Left  | workbench.action.focusLeftEditor   |
| Ctrl+Shift+Alt+Right | Focus into Next Editor on the Right | workbench.action.focusRightEditor  |

## Shortcuts - File Management

| Key          | Command      | Command id                             |
| ------------ | ------------ | -------------------------------------- |
| Ctrl+N       | New File     | workbench.action.files.newUntitledFile |
| Ctrl+O       | Open File... | workbench.action.files.openFile        |
| Ctrl+S       | Save         | workbench.action.files.save            |
| unassigned   | Save All     | workbench.action.files.saveAll         |
| Ctrl+Shift+S | Save As...   | workbench.action.files.saveAs          |

## Shortcuts - Display

| Key           | Command                        | Command id                                  |
| ------------- | ------------------------------ | ------------------------------------------- |
| F11           | Toggle Full Screen             | workbench.action.toggleFullScreen           |
| Ctrl+=        | Zoom in                        | workbench.action.zoomIn                     |
| Ctrl+-        | Zoom out                       | workbench.action.zoomOut                    |
| Ctrl+B        | Toggle Sidebar Visibility      | workbench.action.toggleSidebarVisibility    |
| Ctrl+Shift+D  | Show Debug                     | workbench.view.debug                        |
| Ctrl+Shift+E  | Show Explorer                  | workbench.view.explorer                     |
| Ctrl+Shift+F  | Show Search                    | workbench.view.search                       |
| Ctrl+Shift+J  | Toggle Search Details          | workbench.action.search.toggleQueryDetails  |
| Ctrl+Shift+C  | Open New Console               | workbench.action.terminal.openNativeConsole |
| Ctrl+Shift+U  | Show Output                    | workbench.action.output.showOutput          |
| Ctrl+L L      | Show OmniSharp Log             | omnisharp.show.generalLog                   |
| Ctrl+L Ctrl+L | Show OmniSharp Log to the Side | omnisharp.show.generalLogOnSide             |
| Ctrl+Shift+V  | Toggle Markdown Preview        | workbench.action.markdown.togglePreview     |

## Shortcuts - Debug

| Key       | Command           | Command id                           |
| --------- | ----------------- | ------------------------------------ |
| F9        | Toggle Breakpoint | editor.debug.action.toggleBreakpoint |
| F5        | Continue          | workbench.action.debug.play          |
| F5        | Pause             | workbench.action.debug.start         |
| F11       | Step Into         | workbench.action.debug.stepInto      |
| Shift+F11 | Step Out          | workbench.action.debug.stepOut       |
| F10       | Step Over         | workbench.action.debug.stepOver      |
| Shift+F5  | Stop              | workbench.action.debug.stop          |

## Shortcuts - Tasks

| Key          | Command        | Command id                   |
| ------------ | -------------- | ---------------------------- |
| Ctrl+Shift+B | Run Build Task | workbench.action.tasks.build |
| Ctrl+Shift+T | Run Test Task  | workbench.action.tasks.test  |
