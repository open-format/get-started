install: 
	@bun install

db: 
	@cd backend && npx prisma migrate dev

generate-env-files:
	@cp backend/.env.example backend/.env
	@cp frontend/.env.local.example frontend/.env.local
	@echo "Environment files copied..."

setup: install generate-env-files db 