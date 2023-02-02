db.createUser({
  user: "nes",
  pwd: "nes1123",
  roles: [
    {
      role: "userAdmin", db: "nes"
    }
  ]
})
db.createUser({
  user: "root",
  pwd: "pwd",
  roles: ["root"]
})