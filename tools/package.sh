#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
package_dir="$repo_dir/packages"

mkdir -p "$package_dir"

package_script() {
  source_name=$1
  output_name=$2
  shift 2
  source_dir="$repo_dir/scripts/$source_name"
  output_path="$package_dir/$output_name.scripting"

  test -f "$source_dir/script.json"
  rm -f "$output_path"
  (
    cd "$source_dir"
    COPYFILE_DISABLE=1 zip -X -0 -q -r "$output_path" . "$@"
  )
  echo "Created packages/$output_name.scripting"
}

package_script "ParcelBoard" "ParcelBoard" \
  -x "tests/*" "types/*" ".check-dist/*" "tsconfig.json" ".DS_Store"
package_script "Codex Quota Safe" "Codex-Quota-Safe" \
  -x ".DS_Store"
