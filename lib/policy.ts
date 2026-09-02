
export function can(user: any, action: string, resource: any) {
  if (user.permissions?.includes("*")) return true
  if (user.permissions?.includes(action)) return true

  if (action === "user:update:own") {
    return resource.created_by === user.id
  }

  return false
}
