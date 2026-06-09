[plugin:vite:react-babel] C:\Projetos\conselhoIA\frontend\src\pages\ChatPage.tsx: Identifier 'uploadAttachmentRequest' has already been declared. (17:29)
  20 |   const { chatId } = useParams<{ chatId: string }>()
C:/Projetos/conselhoIA/frontend/src/pages/ChatPage.tsx:17:29
15 |    uploadAttachment as uploadAttachmentRequest,
16 |  } from '@/api/attachments'
17 |  import { uploadAttachment as uploadAttachmentRequest } from '@/api/attachments'
   |                                               ^
18 |  
19 |  export default function ChatPage() {
    at constructor (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:365:19)
    at TypeScriptParserMixin.raise (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:6616:19)
    at TypeScriptScopeHandler.declareName (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:4878:21)
    at TypeScriptParserMixin.declareNameFromIdentifier (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:7584:16)
    at TypeScriptParserMixin.checkIdentifier (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:7580:12)
    at TypeScriptParserMixin.checkLVal (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:7517:12)
    at TypeScriptParserMixin.finishImportSpecifier (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14283:10)
    at TypeScriptParserMixin.parseImportSpecifier (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14436:17)
    at TypeScriptParserMixin.parseImportSpecifier (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:10165:18)
    at TypeScriptParserMixin.parseNamedImportSpecifiers (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14415:36)
    at TypeScriptParserMixin.parseImportSpecifiersAndAfter (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14259:37)
    at TypeScriptParserMixin.parseImport (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14252:17)
    at TypeScriptParserMixin.parseImport (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:9370:26)
    at TypeScriptParserMixin.parseStatementContent (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:12893:27)
    at TypeScriptParserMixin.parseStatementContent (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:9525:18)
    at TypeScriptParserMixin.parseStatementLike (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:12784:17)
    at TypeScriptParserMixin.parseModuleItem (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:12761:17)
    at TypeScriptParserMixin.parseBlockOrModuleBlockBody (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:13333:36)
    at TypeScriptParserMixin.parseBlockBody (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:13326:10)
    at TypeScriptParserMixin.parseProgram (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:12639:10)
    at TypeScriptParserMixin.parseTopLevel (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:12629:25)
    at TypeScriptParserMixin.parse (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14505:25)
    at TypeScriptParserMixin.parse (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:10143:18)
    at parse (C:\Projetos\conselhoIA\frontend\node_modules\@babel\parser\lib\index.js:14539:38)
    at parser (C:\Projetos\conselhoIA\frontend\node_modules\@babel\core\lib\parser\index.js:41:34)
    at parser.next (<anonymous>)
    at normalizeFile (C:\Projetos\conselhoIA\frontend\node_modules\@babel\core\lib\transformation\normalize-file.js:64:37)
    at normalizeFile.next (<anonymous>)
    at run (C:\Projetos\conselhoIA\frontend\node_modules\@babel\core\lib\transformation\index.js:22:50)
    at run.next (<anonymous>)
    at transform (C:\Projetos\conselhoIA\frontend\node_modules\@babel\core\lib\transform.js:22:33)
    at transform.next (<anonymous>)
    at step (C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:261:32)
    at C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:273:13
    at async.call.result.err.err (C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:223:11)
    at C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:189:28
    at C:\Projetos\conselhoIA\frontend\node_modules\@babel\core\lib\gensync-utils\async.js:67:7
    at C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:113:33
    at step (C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:287:14)
    at C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:273:13
    at async.call.result.err.err (C:\Projetos\conselhoIA\frontend\node_modules\gensync\index.js:223:11