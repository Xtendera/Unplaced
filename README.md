# Unplaced

A website clone of r/place on Reddit! Complete one action every minute on a shared pixel art board that resets every day! See other user's cursors, and draw with different colors and brush sizes!

## Run

This project contains two submodules: The vite client and the express/SocketIO server. To install:
```bash
cd client && bun install
cd ../server && bun install
```

To run a devleopment setup (backend and frontend):
```bash
bun run dev
```

To run and build the client in production:
```bash
cd client && bun run build
bun run start
```

To run the backend:
```bash
cd server && bun index.ts
```

## Credits

This project uses express, socketIO, vite, react-color. AI usage is minimal (<5%).