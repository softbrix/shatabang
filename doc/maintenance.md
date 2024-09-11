# Maintenance

## Updating external dependencies

1. List outdated packages
```bash
npm outdated
```

2. Update the package
```bash
npm install <package-name>@latest --workspace=server --workspace=processor
```

3. iterate until all packages are updated

4. run the tests
```bash
npm run test
```