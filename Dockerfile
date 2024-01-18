FROM node:14 as frontend
WORKDIR /app
COPY . /app
RUN npm install --production
RUN npm run build

FROM node:14 as backend
WORKDIR /app
COPY /backend /app
RUN npm install

FROM node:14
WORKDIR /app
COPY --from=backend /app /app/
COPY --from=frontend /app/build /app/build

EXPOSE 8080

CMD ["npm", "run", "start"]
