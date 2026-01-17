# HashWeb CLI

The CLI is a functionally identical way to interact with HashWeb notes.
It supports text, files, expiration, password, etc.

## Installation

```bash
npx hashweb

# Or install globally
npm -g install hashweb
hashweb
```

## Examples

```bash
# Create simple note
hashweb send text "Foo bar"

# Send two files
hashweb send file my.pdf picture.png

# 3 views
hashweb send text "My message" --views 3

# 10 minutes
hashweb send text "My message" --minutes 10

# Custom password
hashweb send text "My message" --password "1337"

# Password from stdin
echo "1337" | hashweb send text "My message"

# Open a link
hashweb open https://hashweb.xyz/note/16gOIkxWjCxYNuXM8tCqMUzl...
```

## Options

### Custom server

The default server is `localhost:3002`, however you can use any HashWeb server by passing the `-s` or `--server` option, or by setting the `HASHWEB_SERVER` environment variable.

### Password

Optionally, just like in the web ui, you can choose to use a manual password. You can do that by passing the `-p` or `--password` options, or by piping it into stdin.

```bash
echo "my pw" | hashweb send text "my text"
cat pass.txt | hashweb send text "my text"
```
