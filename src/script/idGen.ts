const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const id = (): string => {
  const id = new Array<string>();

  id.push(Date.now().toString(36));

  for (let i = 0; i < 8; i++) {
    id.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  return id.join("");
};
