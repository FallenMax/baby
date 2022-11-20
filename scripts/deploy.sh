set -e

target=$1
host=root@129.226.151.217
port=22

if [ $target = 'dev' ]; then
  app_dir=/root/apps/baby_dev
  start_cmd="pm2 startOrRestart pm2_dev.json"
elif [ $target = 'prod' ]; then
  app_dir=/root/apps/baby
  start_cmd="pm2 startOrRestart pm2_prod.json"
else
  echo 'unknown target'
  exit 1
fi

echo "deploying: $target"

yarn
yarn run lint
# yarn run test

ssh $host -p$port <<EOF
  set -e

  echo 'updating...'
  cd $app_dir
  git fetch --all --prune
  git branch -D tmp || echo 'no tmp'
  git checkout -b tmp
  git branch -D master || echo 'no master'
  git checkout master

  export GIT_REVISION=$(git rev-parse HEAD)

  echo 'install...'
  yarn

  echo 'building...'
  yarn build

  echo 'restarting...'
  $start_cmd

  pm2 ls

  echo 'deploy done'
EOF

echo 'done deploy'
