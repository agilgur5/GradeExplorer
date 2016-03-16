# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = 'phusion/ubuntu-14.04-amd64'

  # create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network 'private_network', ip: '12.12.12.12'

  # customize VirtualBox provider
  config.vm.provider 'virtualbox' do |vb|
    vb.memory = '2048'
  end

  # sync the codebase to /vagrant
  # VFS by default, NFS if available
  config.vm.synced_folder './', '/vagrant'
  config.vm.synced_folder './', '/vagrant', type: 'nfs'
  
  # provision the image
  config.vm.provision 'shell', path: 'provision.sh', name: 'provision'

  # run all services on every vagrant up / reload
  config.vm.provision 'shell', path: 'run_services.sh', name: 'services',
    run: 'always'
end
