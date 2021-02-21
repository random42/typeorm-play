source .env; source _.sh;

alias up="sudo docker-compose build && sudo docker-compose up"
alias down="sudo docker-compose down"
alias sh="docker-compose exec -it typeorm-play_app -- bash"