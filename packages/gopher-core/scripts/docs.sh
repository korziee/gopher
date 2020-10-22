touch ../../docs/.nojekyll
touch ../../docs/config.yml

echo "include:
  - \"_*_.html\"
  - \"_*_.*.html\"" > ../../docs/config.yml