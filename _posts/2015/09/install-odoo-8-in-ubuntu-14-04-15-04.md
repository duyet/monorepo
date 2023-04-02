---
template: post
title: Install Odoo 8 in Ubuntu 14.04/15.04
date: "2015-09-22"
author: Van-Duyet Le
tags:
- Linux
- Tutorial
- Ubuntu
- Install
- Python
- Odoo
modified_time: '2018-09-01T22:29:37.931+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4097132143425802073
blogger_orig_url: https://blog.duyet.net/2015/09/install-odoo-8-in-ubuntu-14-04-15-04.html
slug: /2015/09/install-odoo-8-in-ubuntu-14-04-15-04.html
category: Linux
description: Cài đặt Odoo trên Ubuntu 14.04/15.04
fbCommentUrl: none
---

You can simply [download](https://www.odoo.com/page/download) a .deb (for Debian/Ubuntu type systems) or a. rpm (Redhat/CentOS) package of OpenERP and install that. Unfortunately that approach doesn’t provide us (Libertus Solutions) with enough fine-grained control over where things get installed, and it restricts our flexibility to modify & customise, hence I prefer to do it a slightly more manual way (this install process below should only take about 10-15 minutes once the host machine has been built). 

# Step 1. Create the Odoo user that will own and run the application #

```
sudo adduser --system --home=/opt/odoo --group odoo
```

- This is a **"system"** user. It is there to own and run the application, it isn’t supposed to be a person type user with a login etc.
- I"ve specified a **"home"** of `/opt/odoo`, this is where the OpenERP server code will reside and is created automatically by the command above.

Note: How to run the Odoo server as the odoo system user from the command line if it has no shell. `bash sudo su - odoo -s /bin/bash`

# Step 2. Install and configure the database server, PostgreSQL #

```
sudo apt-get install postgresql

```

Then configure the Odoo user on **postgres**:

First change to the postgres user so we have the necessary privileges to configure the database.

```
sudo su - postgres

```

Now create a new database user. This is so Odoo has access rights to connect to PostgreSQL and to create and drop databases. Remember what your choice of password is here; you will need it later on:

```
createuser --createdb --username postgres --no-createrole --no-superuser --pwprompt odoo
Enter password for new role: ********
Enter it again: ********

```

Finally exit from the postgres user account:

```
exit
```

# Step 3. Install the necessary Python libraries for the server #

```
sudo apt-get install python-cups python-dateutil python-decorator python-docutils python-feedparser \
python-gdata python-geoip python-gevent python-imaging python-jinja2 python-ldap python-libxslt1 \
python-lxml python-mako python-mock python-openid python-passlib python-psutil python-psycopg2 \
python-pybabel python-pychart python-pydot python-pyparsing python-pypdf python-reportlab python-requests \
python-simplejson python-tz python-unicodecsv python-unittest2 python-vatnumber python-vobject \
python-werkzeug python-xlwt python-yaml wkhtmltopdf

```

# Step 4. Install the Odoo server #

Install Git.

```
sudo apt-get install git

```

Switch to the Odoo user:

```
sudo su - odoo -s /bin/bash

```

Grab a copy of the most current Odoo 8 branch (Note the "." at the end of this command!):

```
cd /opt/odoo
git clone https://www.github.com/odoo/odoo --depth 1 --branch 8.0 --single-branch .
exit # Exit odoo user

```

# Step 5. Configuring the OpenERP application #

The default configuration file for the server (`/opt/odoo/debian/openerp-server.conf`) is actually very minimal and will, with only a small change work fine so we’ll copy that file to where we need it and change it’s ownership and permissions:

```
sudo cp /opt/odoo/debian/openerp-server.conf /etc/odoo-server.conf
sudo chown odoo: /etc/odoo-server.conf
sudo chmod 640 /etc/odoo-server.conf

```

The above commands make the file owned and writeable only by the odoo user and group and only readable by odoo and root.

To allow the odoo server to run initially, you should only need to change two lines in this file. Open file via **nano** or **vim** or your favourite text editor here

I'm using nano: `bash sudo nano /etc/odoo-server.conf`

And change:

- `db_password = False` to the same password you used back in step 2.
- Then modify the line `addons_path = /usr/lib/python2.7/dist-packages/openerp/addons` so that it reads `addons_path = /opt/odoo/addons` instead
- `logfile = /var/log/odoo/odoo-server.log` the path of log file

Once the configuration file is edited and saved, you can start the server just to check if it actually runs.

```
sudo su - odoo -s /bin/bash
/opt/odoo/openerp-server

```

If you end up with a few lines eventually saying OpenERP (Yes. The log still says OpenERP and not Odoo) is running and waiting for connections then you are all set.

If there are errors, you’ll need to go back and find out where the problem is.

Otherwise simply enter CTL+C to stop the server and then exit to leave the openerp user account and go back to your own shell.

# Step 6. Installing the boot script #

For the final step we need to install a script which will be used to start-up and shut down the server automatically and also run the application as the correct user. There is a script you can use in `/opt/odoo/debian/init` but this will need a few small modifications to work with the system installed the way I have described above. Here’s a link to the one I’ve already modified for Odoo version 8.

TD;DR:

```
sudo cp /opt/odoo/debian/init /etc/init.d/odoo-server

```

Similar to the configuration file, you need to either copy it or paste the contents of this script to a file in `/etc/init.d/` and call it `odoo-server`. Once it is in the right place you will need to make it executable and owned by root:

```
sudo chmod 755 /etc/init.d/odoo-server
sudo chown root: /etc/init.d/odoo-server

```

In the configuration file there’s an entry for the server’s log file. We need to create that directory first so that the server has somewhere to log to and also we must make it writeable by the openerp user:

```
sudo mkdir /var/log/odoo
sudo chown odoo:root /var/log/odoo

```

# Step 7. Testing the server #

To start the Odoo server type:

```
sudo /etc/init.d/odoo-server start

```

You should now be able to view the logfile and see that the server has started.

```
less /var/log/odoo/odoo-server.log

```

If the log file looks OK, now point your web browser at the domain or `IP address of your Odoo server` (or `localhost` if you are on the same machine) and use port `8069`. The url will look something like this:

```
http://localhost:8069

```

What you should see is a screen like this one (it is the Database Management Screen because you have no Odoo databases yet):

Default plain password: `/etc/odoo-server.conf`

After test, Now it’s time to make sure the server stops properly too:

```
sudo /etc/init.d/odoo-server stop

```

Check the log file again to make sure it has stopped and/or look at your server’s process list.

# Step 8. Automating Odoo startup and shutdown #

If everything above seems to be working OK, the final step is make the script start and stop automatically with the Ubuntu Server. To do this type:

```
sudo update-rc.d odoo-server defaults

```

You can now try rebooting you server if you like. Odoo should be running by the time you log back in.

If you type `ps aux | grep odoo` you should see a line similar to this:

```
odoo 1491 0.1 10.6 207132 53596 ? Sl 22:23 0:02 python /opt/odoo/openerp-server -c /etc/odoo-server.conf

```

Which shows that the server is running. And of course you can check the logfile or visit the server from your web browser too.

That’s it!

[http://page.duyetdev.com/Odoo-installation-Ubuntu-14.04-15.04/](http://page.duyetdev.com/Odoo-installation-Ubuntu-14.04-15.04/)
