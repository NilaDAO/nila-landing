#!/usr/bin/env bash
# Regenerate src/w1 sections from dev/nila-design (W1 = LandHome / LandHomeMobile).
set -euo pipefail
cd "$(dirname "$0")/../.."
DS=../nila-design; W=src/w1
N=News,Hero,Metrics,Offers,Wave1,Year,Package,Wave2,Trust,Wave3,Stellar,Backed,How,Globe,GlobeWave,Faq,Footer
rm -rf $W/desktop $W/mobile $W/art
python3 -I scripts/w1/board2jsx.py $DS/boards/LandHome.dc.html $W/desktop D $N
python3 -I scripts/w1/board2jsx.py $DS/boards/LandHomeMobile.dc.html $W/mobile M $N
python3 -I scripts/w1/post.py $W $DS
mkdir -p public/w1 && cp $DS/boards/assets/4b8278e23536dd27822ad11d5527514f.png $DS/boards/assets/a78055d84278654e962d149a8f0dd0c3.png public/w1/
