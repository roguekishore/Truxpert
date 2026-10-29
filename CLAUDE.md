# TRUXPERT

Spring Boot 3.5.x food truck vendor management service.

## Native image status

DONE. Tag: `roguekishore/truxpert:graal`
Always verify the live digest:
```bash
sudo docker inspect -f '{{.RepoDigests}}' roguekishore/truxpert:graal
```

Compose settings (live on the box, checked 2026-10-11):
```yaml
command: ["-Xmx96m"]
mem_limit: 192m
memswap_limit: 192m
```
128m is too tight for a 96m heap (see the spicerack note in `../.deployment/live/docker-compose.yml`). Idle on the box: ~43 MiB.

## Build and push (GitHub Actions)

Actions -> Build and Push -> Run workflow: pick the branch, type a tag. It builds `springapp/Dockerfile.native`
(the plain `Dockerfile` is a JVM build), smoke-tests the binary, and pushes only `roguekishore/truxpert:<tag>`.
The box pulls `:graal`, so to ship: run with tag `graal`, then on the box
`sudo docker-compose pull truxpert && sudo docker-compose up -d truxpert`.
No run has happened yet as of 2026-10-11. Details: `../.deployment/ci/RUNBOOK.md`; the box: `../.deployment/CLAUDE.md`.

## Project-specific native gotchas

- Boot 3.5.x → GraalVM 17 is fine.
- All `@ManyToOne`/`@OneToOne` are EAGER (Brand, Application, Document, Inspection, Review, MenuItem, FoodTruck).
- Pre-existing compile errors fixed: `FoodTruckVendor` missing no-args constructor, `VendorController.LoginRequest` inner class `@Data` issue, `MenuItem` missing `FetchType` import.

## GraalVM shared lessons

@../.claude/graalvm-lessons.md
