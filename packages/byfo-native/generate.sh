read -r -p "Component name (dasherized):
" name

# Process args
# -n = Namespace
while getopts ":n:" opt; do
  case $opt in
    n) namespace="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    exit 1
    ;;
  esac

  case $OPTARG in
    -*) echo "Option $opt needs a valid argument"
    exit 1
    ;;
  esac
done

# Lower case the dasherized name and the namespace
name=`sed -E s/\(.\)/\\\L\\\1/g <<< $name`
namespacetag=`sed -E s/\(.\)/\\\L\\\1/g <<< $namespace`

tag="$namespacetag-$name"

# Create a variable that deletes valid names
badname=`sed -E s/^[a-z][a-z-]+[a-z]$// <<< $name`
# If the name was NOT deleted, then we have a bad name, exit accordingly
if [ $badname ]
then
    echo "Bad name format. Must be letters and dashes only. Must not start or end with a dash"
    exit 1
fi

# Get the name for the javascript class
capitalized=`sed -E s/\(^\|-\)\([a-z]\)/\\\U\\\2/g <<< $name`
classname="$namespace$capitalized"

# Create the file
file="./$tag.mjs"
touch $file

# Fill out the file with template content
echo "//#region template
const template = /*html*/\`

\`
//#endregion

class $classname extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.isConnected) {
      return;
    }
  }

  static get observedAttributes () {
    return [];
  }
  attributeChangedCallback (name,oldV,newV) {

  }

  render () {
    this.innerHTML = template;
  }
}

customElements.define('$tag', $classname);
" > $file
