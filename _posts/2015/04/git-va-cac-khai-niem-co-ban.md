---
template: post
title: Git - Git là gì và các khái niệm cơ bản trong git
date: "2015-04-26"
author: Van-Duyet Le
tags:
- Git
- Khái niệm git
modified_time: '2015-04-26T00:33:45.750+07:00'
thumbnail: https://4.bp.blogspot.com/-ZYIJIZWTj-I/VTvM1dMdDCI/AAAAAAAACWA/_V9XNOLwkAw/s1600/2color-lightbg%402x.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7419508156233320114
blogger_orig_url: https://blog.duyet.net/2015/04/git-va-cac-khai-niem-co-ban.html
slug: /2015/04/git-va-cac-khai-niem-co-ban.html
category: Git
description: Bạn là lập trình viên, và đôi khi bạn muốn đưa về trạng thái trước khi quậy phá của file code nào đó? Cách đơn giản nhất đó là sao chép lại file trước khi chỉnh sửa. Trường hợp dùng phương pháp này thì sẽ phải thường xuyên thực hiện việc thêm ngày đã thay đổi vào tên thư mục hay file. Tuy nhiên, việc tự mình sao chép file mỗi lần chỉnh sửa thì sẽ rất vất vả, và cũng dễ xảy ra nhầm lẫn.
fbCommentUrl: none

---

Bạn là lập trình viên, và đôi khi bạn muốn đưa về trạng thái trước khi quậy phá của file code nào đó? Cách đơn giản nhất đó là sao chép lại file trước khi chỉnh sửa. Trường hợp dùng phương pháp này thì sẽ phải thường xuyên thực hiện việc thêm ngày đã thay đổi vào tên thư mục hay file. Tuy nhiên, việc tự mình sao chép file mỗi lần chỉnh sửa thì sẽ rất vất vả, và cũng dễ xảy ra nhầm lẫn.
Và để giải quyết những vấn đề này thì các hệ thống quản lý phiên bản như Git đã được ra đời.

## Git là gì? ##
Git là một trong những Hệ thống Quản lý Phiên bản Phân tán, vốn được phát triển nhằm quản lý mã nguồn (source code) của Linux.

Trên Git, ta có thể lưu trạng thái của file dưới dạng lịch sử cập nhật. Vì thế, có thể đưa file đã chỉnh sửa một lần về trạng thái cũ hay có thể biết được file đã được chỉnh sửa chỗ nào.

![](https://4.bp.blogspot.com/-ZYIJIZWTj-I/VTvM1dMdDCI/AAAAAAAACWA/_V9XNOLwkAw/s1600/2color-lightbg%402x.png)

Thêm nữa, khi định ghi đè (overwrite) lên file mới nhất đã chỉnh sửa của người khác bằng file đã chỉnh sửa dựa trên file cũ, thì khi upload lên server sẽ hiện ra cảnh cáo. Vì thế, sẽ không xảy ra lỗi khi ghi đè lên nội dung chỉnh sửa của người khác mà không hề hay biết.

Git sử dụng mô hình phân tán, ngược lại so với SVN hoặc CSV. Mỗi nơi lưu source sẽ đc gọi là repositories, không cần lưu trữ tập trung một nơi, mà mỗi thành viên trong team sẽ có một repository ở máy của riêng mình.
Điều đó có nghĩa là nếu có 3 người A,B,C cùng làm việc trong 1 project. Thì bản thân repo trên máy của người A, người B, và người C có thể kết nối được với nhau.

Khi quyết định thay đổi chỗ nào đó lên server ta chỉ cần một thao tác "push" nó lên server. Chúng ta vẫn có thể share thay đổi của chúng ta cho thành viên khác, bằng cách commit hoặc update trực tiếp từ máy của họ mà không phải thông qua repositories gốc trên server (thông qua share ssh cho nhau).

Lợi ích

- An toàn hơn (vì mỗi bản copy của thành viên đều là full copy từ repository gốc, khi server bị down).
- Các thành viên vẫn có thể làm việc offline, họ vẫn có thể commit và update trên local của họ hoặc thậm chí với nhau mà không cần thông qua server.
- Khi server hoạt động trở lại, họ có thể cập nhật tất cả lên lại server.

Tiếp đây mình xin giới thiệu về các khái niệm mà bạn cần nắm trong git:

## Kho Repo (Repository) ##
Repository hay được gọi tắt là Repo, đơn giản là nơi chứa tất cả những thông tin cần thiết để duy trì và quản lý các sửa đổi và lịch sử của toàn bộ project. Trong Repo có 2 cấu trúc dữ liệu chính là Object Store và Index. Tất cả dữ liệu của Repo đèu được chứa trong thư mục bạn đang làm việc dưới dạng folder ẩn có tên là .git

![](https://4.bp.blogspot.com/-fC2tMlgfHXo/VTvNssnSP1I/AAAAAAAACWI/C6nTDooFOiE/s1600/git-repo.png)

## Remote repository và local repository ##
Đầu tiên, repository của Git được phân thành 2 loại là remote repository và local repository.

- Remote repository: Là repository để chia sẻ giữa nhiều người và bố trí trên server chuyên dụng.
- Local repository: Là repository bố trí trên máy của bản thân mình, dành cho một người dùng sử dụng.

Do repository phân thành 2 loại là local và remote nên với những công việc bình thường thì có thể sử dụng local repository. Khi muốn public nội dung công việc mà mình đã làm trên local repository, thì ta sẽ upload lên remote repository rồi public. Thêm nữa, thông qua remote repository bạn cũng có thể lấy về nội dung thay đổi của người khác.

![](https://2.bp.blogspot.com/-aBPG-ztqfk0/VTvHH59jZkI/AAAAAAAACVc/eXqR_iG3oys/s1600/basic-remote-workflow.png)

Nguồn ảnh: www.git-tower.com

## Nhánh (Branch) ##
Đây là một trong những thế mạnh của git là nhánh. Với git, việc quản lý nhánh rất dễ dàng. Mỗi nhánh trong Git gần giống như một workspace. Việc nhảy vào một nhánh để làm việc trong đó tương tự việc chuyển qua ngữ cảnh làm việc mới, và sau đó có thể nhanh chóng quay lại ngữ cảnh cũ.

Nhánh (branch) được dùng để phát triển tính năng mới mà không làm ảnh hưởng đến code hiện tại.

Nhánh master là nhánh "mặc định" khi bạn tạo một repository.
Nhánh master thông thường là nhánh chính của ứng dụng. Ví dụ bạn thử nghiệm một tính năng mới và muốn không ảnh hưởng đến code chính bạn có thể tạo một nhánh mới và sau khi xong sẽ hợp nhất lại với nhánh master. Việc hợp nhất 2 nhánh lại được gọi là merge.

![](https://4.bp.blogspot.com/-lwRXq80wt0U/VTvGLbXUrgI/AAAAAAAACVU/ekAhTHuKmBM/s1600/branches.png)

Nguồn ảnh: http://rogerdudler.github.io/git-guide/index.vi.html

## Trộn (Merge) ##
Trộn source từ một nhánh khác vào nhánh hiện tại. Bạn sẽ hiểu sâu hơn về nó trong các ví dụ ở các bài sau.
Chú ý:

- Kiểm tra branch hiện đang làm việc trước khi merge
- Phải đẩy tất cả những thay đổi dưới máy local lên Git trước khi merge
- Trước khi merge phải lấy hết những thay đổi mới nhất của các branch khác, hay ít nhất là branch cần merge về máy
- Merge thành công thì nên đẩy source lên lại lên server
- Nên merge bằng GUI tool.

## Xung đột (Conflict) ##

Conflic là trường hợp có 2 sự thay đổi trong một dòng code và máy tính không thể tự quyết định dòng code nào là "đúng". Đúng ở đây có nghĩa là "ý đồ của lập trình viên".

Để giải quyết mâu thuẫn bạn phải dùng "tay không" để sữa các xung đột này. Bạn chỉ việc nhìn vào file bị conflict và tự quyết định dòng code nào giữ lại, dòng nào xóa bỏ.

## Commit  ##

Để ghi lại việc thêm/thay đổi file hay thư mục vào repository thì sẽ thực hiện thao tác gọi là Commit.

Khi thực hiện commit, trong repository sẽ tạo ra commit (hoặc revision) đã ghi lại sự khác biệt từ trạng thái đã commit lần trước với trạng thái hiện tại.

Commit này đang được chứa tại repository, các commit nối tiếp với nhau theo thứ tự thời gian. Bằng việc lần theo commit này từ trạng thái mới nhất thì có thể biết được lịch sử thay đổi trong quá khứ hoặc nội dung thay đổi đó.

![](https://2.bp.blogspot.com/-ck1jR2dDy6s/VTvIjBktgaI/AAAAAAAACVo/D-_6lpJqojQ/s1600/capture_intro1_3_1.png)

Các commit này, được đặt tên bởi 40 ký tự alphabet (mã md5 thì phải) không trùng nhau được băm từ thông tin commit. Bằng việc đặt tên cho commit, có thể chỉ định commit nào từ trong repository.

Mỗi commit đều có yêu cầu phải có commit message, để giải thích commit này là bạn đã làm gì trong này. 

## Git Remote 

Để kết nối được với một repo khác người ta sử dụng một khái niệm gọi là remote.

Trên thực tế khi làm việc với nhau thì không như vậy, vì không phải máy ai cũng cài một "git server" để người khác kết nối được với mình. Thông thường thì chúng ta sẽ sử dụng một repo chung và các máy kết nối vào repo đó.

Có 2 "git repo server" được sử dụng nhiều là github.com và bitbucket.org. 

Trên thực tế khi có 2 người cùng làm việc với 1 project thì thông thường sẽ tạo một repo trên github hoặc bitbucket và repo trên máy người A sẽ kết nối với repo trên github và máy người B cũng kết nối với repo trên github/bitbucket. Từ đó source code của người A và người B sẽ được đồng bộ với nhau thông qua repo trên github/bitbucket.

Vì vậy, trước khi sử dụng git thì bạn nên đăng kí một tài khoản trên github.com hoặc bitbucket.org.

## Working Tree và Index 

Trên Git, những thư mục được đặt trong sự quản lý của Git mà mọi người đang thực hiện công việc trong thực tế được gọi là working tree.

Và trên Git, giữa repository và working tree tồn tại một nơi gọi là index. Index là nơi để chuẩn bị cho việc commit lên repository.

![](https://2.bp.blogspot.com/-v1OCS7kHYBU/VTvKIXupM-I/AAAAAAAACV0/Mr-2OnCtKT4/s1600/capture_intro1_4_1.png)

Nguồn ảnh: backlogtool

Trên Git, khi đã thực hiện commit thì trạng thái sẽ không được ghi trực tiếp trong repository từ working tree, mà sẽ ghi trạng thái đã được thiết lập của index được xây dựng ở giữa đó. Vì thế, để ghi lại trạng thái của file bằng commit thì trước hết cần thông báo file trong index.

## Kết ##

Còn khá nhiều định nghĩa trên Git, trên đây mình chỉ nói một vài định nghĩa quan trọng, mình sẽ cố gắng cập nhật đầy đủ sau. 

Ở bài sau mình sẽ hướng dẫn cách sử dụng Git, sử dụng github, các làm việc trên git và xử lý các trường hợp thường gặp khi teamwork với Git. 

Bài viết được post tại [LvDuit Blog](https://blog.duyet.net/) và [LvDuit Wordpress](http://lvduit.wordpress.com/).

## Tham khảo  ##

1. [Git Community Book](http://book.git-scm.com/)
2. [Pro Git](http://progit.org/book/)
3. [Think like a git](http://think-like-a-git.net/)
4. [GitHub Help](http://help.github.com/)
5. [A Visual Git Guide](http://marklodato.github.com/visual-git-guide/index-en.html)
6. [Learn Git Branching](http://pcottle.github.io/learnGitBranching/)
7. [More Git and GitHub Secrets](http://zachholman.com/talk/more-git-and-github-secrets/)
8. [Understanding Git Conceptually](http://www.sbf5.com/~cduan/technical/git/)
