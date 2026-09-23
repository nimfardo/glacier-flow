# Gates — feat-008

## G1 — no tracked file carries a CR byte
CHECK: node -e "const{execSync}=require('child_process');const fs=require('fs');const bad=execSync('git ls-files -z').toString().split('\0').filter(Boolean).filter(f=>{try{return fs.readFileSync(f).includes(13)}catch{return false}});console.log(bad.length?'CR: '+bad.join(' '):'scanned')"
EXPECT: ^scanned$
EVIDENCE: met 2026-09-23T07:35:51Z exit=0 digest=3fa1853e out="scanned"

## G2 — git normalizes this repository to LF
CHECK: git check-attr eol -- CLAUDE.md
EXPECT: eol: lf$
EVIDENCE: met 2026-09-23T07:35:51Z exit=0 digest=f27e1086 out="CLAUDE.md: eol: lf"
