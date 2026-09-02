export async function deleteEntities(entity: string, ids: string[]) {
  const res = await fetch(`/api/admin/${entity}/bulk-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}
