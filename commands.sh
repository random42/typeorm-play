source .env; source _.sh;

alias build="npm run build"
alias docker-build="sudo docker-compose build"
alias up="sudo docker-compose up"
alias down="sudo docker-compose down"
alias logs="docker logs typeorm-play_app_1"
alias sh="docker-compose exec -it typeorm-play_app -- bash"