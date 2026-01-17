.PHONY: dev clean build start help

# Default target
help:
	@echo "Tersedia perintah:"
	@echo "  make dev   - Bersihkan proses lama & jalankan server development"
	@echo "  make clean - Hentikan proses di port 3000 & hapus lock file"
	@echo "  make build - Build aplikasi untuk produksi"
	@echo "  make start - Jalankan aplikasi hasil build produksi"

dev: clean
	rm -rf .next
	npm run dev

clean:
	@echo "🧹 Membersihkan proses lama..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@rm -rf .next/dev/lock 2>/dev/null || true
	@echo "✅ Selesai."

build:
	npm run build

start:
	npm run start
