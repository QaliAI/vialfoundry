import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

/** Run the real server entry points with explicit boundary replacements. */
export function loadTSModule(filename, replacements = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    const relative = path.relative(process.cwd(),file).replaceAll('\\','/');
    if (relative in replacements) return replacements[relative];
    if(cache.has(file))return cache.get(file).exports;
    const nativeRequire=createRequire(file);
    if(!/\.tsx?$/.test(file))return nativeRequire(file);
    const module={exports:{}};cache.set(file,module);
    const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
    const require=specifier=>{
      if(specifier.startsWith('.') || specifier.startsWith('@/')) {
        const base=specifier.startsWith('@/')?path.resolve('src',specifier.slice(2)):path.resolve(path.dirname(file),specifier);
        const resolved=[base,base+'.ts',base+'.tsx',base+'.mjs',path.join(base,'index.ts')].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());
        if(resolved)return load(resolved);
      }
      return nativeRequire(specifier);
    };
    new vm.Script(`(function(require,module,exports){${output}\n})`,{filename:file}).runInThisContext()(require,module,module.exports);
    return module.exports;
  }
  return load(filename);
}
